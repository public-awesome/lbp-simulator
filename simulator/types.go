package simulator

import (
	"bytes"
	"encoding/json"
)

type createPoolInputs struct {
	Weights                  string                         `json:"weights"`
	InitialDeposit           string                         `json:"initial-deposit"`
	SwapFee                  string                         `json:"swap-fee"`
	ExitFee                  string                         `json:"exit-fee"`
	FutureGovernor           string                         `json:"future-governor"`
	SmoothWeightChangeParams smoothWeightChangeParamsInputs `json:"lbp-params"`
}

type smoothWeightChangeParamsInputs struct {
	StartTime         string `json:"start-time"`
	Duration          string `json:"duration"`
	TargetPoolWeights string `json:"target-pool-weights"`
}

type XCreatePoolInputs createPoolInputs

type XCreatePoolInputsExceptions struct {
	XCreatePoolInputs
	Other *string // Other won't raise an error
}

// UnmarshalJSON should error if there are fields unexpected
func (release *createPoolInputs) UnmarshalJSON(data []byte) error {
	var createPoolE XCreatePoolInputsExceptions
	dec := json.NewDecoder(bytes.NewReader(data))
	dec.DisallowUnknownFields() // Force

	if err := dec.Decode(&createPoolE); err != nil {
		return err
	}

	*release = createPoolInputs(createPoolE.XCreatePoolInputs)
	return nil
}
