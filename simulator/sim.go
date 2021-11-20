package simulator

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
	"time"

	sdk "github.com/cosmos/cosmos-sdk/types"
	simapp "github.com/osmosis-labs/osmosis/app"
	gammkeeper "github.com/osmosis-labs/osmosis/x/gamm/keeper"
	"github.com/osmosis-labs/osmosis/x/gamm/types"
	"github.com/tendermint/tendermint/crypto/ed25519"
	tmproto "github.com/tendermint/tendermint/proto/tendermint/types"
)

type PriceData struct {
	Time  int64   `json:"time"`
	Price sdk.Dec `json:"value"`
}

type SimulationResponse struct {
	Data        []PriceData `json:"data"`
	DailyVolume int64       `json:"daily_volume"`
	TotalVolume int64       `json:"total_volume"`
	TotalBuys   int64       `json:"total_buys"`
}

func Simulate(
	poolParams types.PoolParams,
	poolAssets []types.PoolAsset,
	dailyVolume int64) (*SimulationResponse, error) {

	app := simapp.Setup(false)
	startTime := poolParams.SmoothWeightChangeParams.StartTime
	ctx := app.BaseApp.NewContext(false, tmproto.Header{}).WithBlockTime(startTime)
	var (
		acc1 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
		acc2 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
		acc3 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
		acc4 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
		acc5 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
	)
	days := int(math.Round(poolParams.SmoothWeightChangeParams.Duration.Hours() / 24))

	// volume simulation
	lbpParams := poolParams.SmoothWeightChangeParams
	simulatedBuys := make([]SimulatedBuyInfo, 0, Partitions*days) // pre-allocate capacity
	total := int64(0)
	rand.Seed(time.Now().UnixNano())
	for day := 0; day < days; day++ {
		txs := RandSplitVolume(dailyVolume)
		startTime := lbpParams.StartTime.Add(time.Hour * 24 * time.Duration(day))
		for _, amount := range txs {
			total = total + amount
			buyTime := startTime.Add(time.Minute * time.Duration(rand.Intn(1400))) // random minute of a day
			simulatedBuys = append(simulatedBuys, SimulatedBuyInfo{amount, buyTime})
		}
	}
	sort.Slice(simulatedBuys, func(i, j int) bool {
		return simulatedBuys[i].Time.Before(simulatedBuys[j].Time)
	})

	// funder
	var funderCoins sdk.Coins
	for _, a := range poolAssets {
		funderCoins = append(funderCoins, a.Token.Add(sdk.NewInt64Coin(a.Token.Denom, 1_000_000_000))) // add 1,000 extra of each coin
	}
	// funderCoins = funderCoins.Add(sdk.NewCoin("uosmo", sdk.NewInt(1_000_000_000))) // pool creation fee is 1,000
	err := app.BankKeeper.AddCoins(
		ctx,
		acc1,
		funderCoins,
	)
	if err != nil {
		panic(err)
	}
	buyers := []sdk.AccAddress{acc2, acc3, acc4, acc5}
	// Mint some assets to the accounts.
	for _, acc := range buyers {
		amount := dailyVolume * int64(days+1) * 1_000_000 // enough for total volume per single account
		err := app.BankKeeper.AddCoins(
			ctx,
			acc,
			sdk.NewCoins(
				sdk.NewInt64Coin("uosmo", amount),
			),
		)
		if err != nil {
			return nil, err
		}
	}

	poolId, err := app.GAMMKeeper.CreatePool(ctx, acc1, poolParams, poolAssets, "")
	if err != nil {
		return nil, err
	}

	endTime := startTime.Add(poolParams.SmoothWeightChangeParams.Duration)
	currentTime := startTime

	prices := make([]PriceData, 0)
	var totalAmount, totalBuys int64
	for currentTime.Before(endTime) {
		ctx = ctx.WithBlockTime(currentTime)
		var amount, buys int64
		simulatedBuys, amount, buys, err = ExecuteBuys(ctx, app.GAMMKeeper, poolId, simulatedBuys, buyers)
		if err != nil {
			return nil, err
		}
		totalAmount = totalAmount + amount
		totalBuys = totalBuys + buys
		spotPrice, err := app.GAMMKeeper.CalculateSpotPriceWithSwapFee(ctx, poolId, "uosmo", "ustars")
		if err != nil {
			return nil, err
		}
		prices = append(prices, PriceData{currentTime.Unix(), spotPrice})
		currentTime = currentTime.Add(time.Minute * 5)
	}
	resp := &SimulationResponse{Data: prices, TotalVolume: totalAmount, TotalBuys: totalBuys, DailyVolume: dailyVolume}
	return resp, nil
}

// ExecuteBuys will execute buys where buy.Time < ctx.BlockTime() and removing them after
// assumes simulatedBuys has been sorted by time
func ExecuteBuys(ctx sdk.Context, keeper gammkeeper.Keeper, poolId uint64,
	simulatedBuys []SimulatedBuyInfo, buyers []sdk.AccAddress) ([]SimulatedBuyInfo, int64, int64, error) {
	if len(simulatedBuys) == 0 {
		return simulatedBuys, 0, 0, nil
	}

	if simulatedBuys[0].Time.After(ctx.BlockTime()) {
		return simulatedBuys, 0, 0, nil
	}
	var totalAmount, buys int64
	for i := 0; i < len(simulatedBuys); i++ {
		currentBuy := simulatedBuys[i]
		if currentBuy.Time.After(ctx.BlockTime()) {
			break
		}
		buyer := buyers[rand.Intn(len(buyers))]
		pool, err := keeper.GetPool(ctx, poolId)
		if err != nil {
			return simulatedBuys, totalAmount, buys, err
		}
		msg, err := CreateSwapExactAmountIn(buyer, sdk.NewInt64Coin("uosmo", currentBuy.Amount*1_000_000), pool)
		if err != nil {
			fmt.Println(err)
			return simulatedBuys, totalAmount, buys, err
		}
		msgServer := gammkeeper.NewMsgServerImpl(keeper)
		_, err = msgServer.SwapExactAmountIn(sdk.WrapSDKContext(ctx), msg)
		if err != nil {
			return simulatedBuys, totalAmount, buys, err
		}
		totalAmount = totalAmount + currentBuy.Amount
		buys++
	}
	simulatedBuys = simulatedBuys[buys:]
	return simulatedBuys, totalAmount, buys, nil
}
