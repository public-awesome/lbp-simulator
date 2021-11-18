package simulator_test

import (
	"fmt"
	"testing"

	"github.com/public-awesome/lbp-simulator/simulator"
)

func TestSomething(t *testing.T) {
	sample := []byte(`{
		"weights": "90ustars,10uosmo",
		"initial-deposit": "50000000000000ustars,125000000000uosmo",
		"swap-fee": "0.003",
		"exit-fee": "0.001",
		"lbp-params": {
			"duration": "120h",
			"target-pool-weights": "1ustars,1uosmo"
		}
	}`)
	poolMsg, err := simulator.CreatePoolMsg(sample)
	if err != nil {
		t.Fatal(err)
	}
	txs := simulator.RandSplitVolume(1_000_000)
	fmt.Println(txs)
	total := int64(0)
	for _, t := range txs {
		total = total + t
	}
	fmt.Println(total)
	simulator.Simulate(poolMsg.PoolParams, poolMsg.PoolAssets)
}
