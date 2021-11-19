package simulator

import (
	"time"

	sdk "github.com/cosmos/cosmos-sdk/types"
	simapp "github.com/osmosis-labs/osmosis/app"
	"github.com/osmosis-labs/osmosis/x/gamm/types"
	"github.com/tendermint/tendermint/crypto/ed25519"
	tmproto "github.com/tendermint/tendermint/proto/tendermint/types"
)

type PriceData struct {
	Time  int64   `json:"time"`
	Price sdk.Dec `json:"value"`
}

func Simulate(poolParams types.PoolParams, poolAssets []types.PoolAsset) ([]PriceData, error) {
	app := simapp.Setup(false)
	startTime := poolParams.SmoothWeightChangeParams.StartTime
	ctx := app.BaseApp.NewContext(false, tmproto.Header{}).WithBlockTime(startTime)
	var (
		acc1 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
		acc2 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
		acc3 = sdk.AccAddress(ed25519.GenPrivKey().PubKey().Address().Bytes())
	)
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

	// Mint some assets to the accounts.
	for _, acc := range []sdk.AccAddress{acc2, acc3} {
		err := app.BankKeeper.AddCoins(
			ctx,
			acc,
			sdk.NewCoins(
				sdk.NewCoin("uosmo", sdk.NewInt(1_000_000_000_000)), // 1M OSMO
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
	for currentTime.Before(endTime) {
		ctx = ctx.WithBlockTime(currentTime)

		spotPrice, err := app.GAMMKeeper.CalculateSpotPriceWithSwapFee(ctx, poolId, "uosmo", "ustars")
		if err != nil {
			return nil, err
		}
		prices = append(prices, PriceData{currentTime.Unix(), spotPrice})
		currentTime = currentTime.Add(time.Minute * 5)
	}

	return prices, nil
}
