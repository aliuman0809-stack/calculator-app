package com.example.calculatorbackend.service;

import com.example.calculatorbackend.entity.CalculationHistory;
import com.example.calculatorbackend.repository.CalculationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CalculatorService {

    @Autowired
    private CalculationRepository repository;

    public CalculationHistory calculate(Double first, Double second, String operation) {
        if (first == null || operation == null || operation.isBlank()) {
            throw new IllegalArgumentException("First number and operation are required");
        }

        // Second number optional hai (sqrt, percent, reciprocal ke liye)
        double secondValue = (second == null) ? 0 : second;
        double result;

        switch (operation.toLowerCase().trim()) {
            // ===== Basic Operations =====
            case "add":
                result = first + secondValue;
                break;
            case "subtract":
                result = first - secondValue;
                break;
            case "multiply":
                result = first * secondValue;
                break;
            case "divide":
                if (secondValue == 0) {
                    throw new ArithmeticException("Cannot divide by zero");
                }
                result = first / secondValue;
                break;

            // ===== Scientific Operations =====
            case "sqrt":
                if (first < 0) {
                    throw new ArithmeticException("Cannot take square root of negative number");
                }
                result = Math.sqrt(first);
                break;
            case "power":
                result = Math.pow(first, secondValue);
                break;
            case "reciprocal":
                if (first == 0) {
                    throw new ArithmeticException("Cannot divide by zero");
                }
                result = 1 / first;
                break;
            case "percent":
                result = first / 100;
                break;

            default:
                throw new IllegalArgumentException("Invalid operation: " + operation);
        }

        // Round to 10 decimal places to avoid floating point errors
        result = Math.round(result * 1e10) / 1e10;

        CalculationHistory history = new CalculationHistory(
                first,
                secondValue,
                operation.toLowerCase().trim(),
                result
        );
        return repository.save(history);
    }

    public List<CalculationHistory> getHistory() {
        return repository.findTop10ByOrderByCreatedAtDesc();
    }

    public void clearHistory() {
        repository.deleteAll();
    }
}