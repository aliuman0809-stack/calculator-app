package com.example.calculatorbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CalculationHistory")
public class CalculationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "FirstNumber", nullable = false)
    private Double firstNumber;

    @Column(name = "SecondNumber", nullable = false)
    private Double secondNumber;

    @Column(name = "Operation", nullable = false, length = 20)
    private String operation;

    @Column(name = "Result", nullable = false)
    private Double result;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CalculationHistory() {}

    public CalculationHistory(Double firstNumber, Double secondNumber, String operation, Double result) {
        this.firstNumber = firstNumber;
        this.secondNumber = secondNumber;
        this.operation = operation;
        this.result = result;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getFirstNumber() { return firstNumber; }
    public void setFirstNumber(Double firstNumber) { this.firstNumber = firstNumber; }

    public Double getSecondNumber() { return secondNumber; }
    public void setSecondNumber(Double secondNumber) { this.secondNumber = secondNumber; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public Double getResult() { return result; }
    public void setResult(Double result) { this.result = result; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}