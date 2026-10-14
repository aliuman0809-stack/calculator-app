package com.example.calculatorbackend.dto;

public class CalculationRequest {

    private Double firstNumber;
    private Double secondNumber;
    private String operation;

    public CalculationRequest() {}

    public Double getFirstNumber() { return firstNumber; }
    public void setFirstNumber(Double firstNumber) { this.firstNumber = firstNumber; }

    public Double getSecondNumber() { return secondNumber; }
    public void setSecondNumber(Double secondNumber) { this.secondNumber = secondNumber; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
}