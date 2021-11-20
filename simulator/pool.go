package simulator

import (
	"errors"
	"fmt"
	"time"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/osmosis-labs/osmosis/x/gamm/types"
)

func CreateSwapExactAmountIn(sender sdk.AccAddress, tokenIn sdk.Coin, pool types.PoolI) (*types.MsgSwapExactAmountIn, error) {
	inPoolAsset, err := pool.GetPoolAsset("uosmo")
	if err != nil {
		return nil, err
	}
	outPoolAsset, err := pool.GetPoolAsset("ustars")
	if err != nil {
		return nil, err
	}
	out := CalcOutGivenIn(
		inPoolAsset.Token.Amount.ToDec(),
		inPoolAsset.Weight.ToDec(),
		outPoolAsset.Token.Amount.ToDec(),
		outPoolAsset.Weight.ToDec(),
		tokenIn.Amount.ToDec(),
		pool.GetPoolParams().SwapFee,
	)
	withSlippage := out.Mul(sdk.NewDecWithPrec(1, 2)) // 1%
	min := out.Sub(withSlippage).TruncateInt()
	msg := &types.MsgSwapExactAmountIn{
		Sender: sender.String(),
		Routes: []types.SwapAmountInRoute{
			{
				PoolId:        pool.GetId(),
				TokenOutDenom: "ustars",
			},
		},
		TokenIn:           tokenIn,
		TokenOutMinAmount: min,
	}
	return msg, nil
}
func CreatePoolMsg(data []byte) (*types.MsgCreatePool, error) {
	pool := &createPoolInputs{}
	// make exception if unknown field exists
	err := pool.UnmarshalJSON(data)
	if err != nil {
		return nil, err
	}

	deposit, err := sdk.ParseCoinsNormalized(pool.InitialDeposit)
	if err != nil {
		return nil, err
	}

	poolAssetCoins, err := sdk.ParseDecCoins(pool.Weights)
	if err != nil {
		return nil, err
	}

	if len(deposit) != len(poolAssetCoins) {
		panic(errors.New("deposit tokens and token weights should have same length"))
	}

	swapFee, err := sdk.NewDecFromStr(pool.SwapFee)
	if err != nil {
		return nil, err
	}

	exitFee, err := sdk.NewDecFromStr(pool.ExitFee)
	if err != nil {
		return nil, err
	}

	var poolAssets []types.PoolAsset
	for i := 0; i < len(poolAssetCoins); i++ {

		if poolAssetCoins[i].Denom != deposit[i].Denom {
			return nil, errors.New("deposit tokens and token weights should have same denom order")
		}

		poolAssets = append(poolAssets, types.PoolAsset{
			Weight: poolAssetCoins[i].Amount.RoundInt(),
			Token:  deposit[i],
		})
	}

	msg := &types.MsgCreatePool{
		PoolParams: types.PoolParams{
			SwapFee: swapFee,
			ExitFee: exitFee,
		},
		PoolAssets:         poolAssets,
		FuturePoolGovernor: pool.FutureGovernor,
	}

	if (pool.SmoothWeightChangeParams != smoothWeightChangeParamsInputs{}) {
		duration, err := time.ParseDuration(pool.SmoothWeightChangeParams.Duration)
		if err != nil {
			return nil, fmt.Errorf("could not parse duration: %w", err)
		}

		targetPoolAssetCoins, err := sdk.ParseDecCoins(pool.SmoothWeightChangeParams.TargetPoolWeights)
		if err != nil {
			return nil, err
		}

		var targetPoolAssets []types.PoolAsset
		for i := 0; i < len(targetPoolAssetCoins); i++ {

			if targetPoolAssetCoins[i].Denom != poolAssetCoins[i].Denom {
				return nil, errors.New("initial pool weights and target pool weights should have same denom order")
			}
			targetPoolAssets = append(targetPoolAssets, types.PoolAsset{
				Weight: targetPoolAssetCoins[i].Amount.RoundInt(),
				Token:  deposit[i],
			})
		}

		smoothWeightParams := types.SmoothWeightChangeParams{
			Duration:           duration,
			InitialPoolWeights: poolAssets,
			TargetPoolWeights:  targetPoolAssets,
		}

		if pool.SmoothWeightChangeParams.StartTime != "" {
			startTime, err := time.Parse(time.RFC3339, pool.SmoothWeightChangeParams.StartTime)
			if err != nil {
				return nil, fmt.Errorf("could not parse time: %w", err)
			}

			smoothWeightParams.StartTime = startTime
		}
		if pool.SmoothWeightChangeParams.StartTime == "" {
			smoothWeightParams.StartTime = time.Now()
		}

		msg.PoolParams.SmoothWeightChangeParams = &smoothWeightParams
	}

	if err != nil {
		return nil, err
	}
	return msg, nil
}
