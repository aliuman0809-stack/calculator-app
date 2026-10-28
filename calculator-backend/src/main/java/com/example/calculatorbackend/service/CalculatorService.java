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

        double secondValue = (second == null) ? 0 : second;
        double result;
        String op = operation.toLowerCase().trim();

        switch (op) {
            // Basic
            case "add": result = first + secondValue; break;
            case "subtract": result = first - secondValue; break;
            case "multiply": result = first * secondValue; break;
            case "divide":
                if (secondValue == 0) throw new ArithmeticException("Cannot divide by zero");
                result = first / secondValue;
                break;
            case "percent": result = first / 100; break;

            // Scientific
            case "sqrt":
                if (first < 0) throw new ArithmeticException("Cannot take square root of negative number");
                result = Math.sqrt(first);
                break;
            case "power": result = Math.pow(first, secondValue); break;
            case "reciprocal":
                if (first == 0) throw new ArithmeticException("Cannot divide by zero");
                result = 1 / first;
                break;
            case "factorial":
                if (first < 0 || first != Math.floor(first)) throw new ArithmeticException("Invalid input for factorial");
                if (first > 170) throw new ArithmeticException("Number too large");
                double fact = 1;
                for (int i = 2; i <= first; i++) fact *= i;
                result = fact;
                break;
            case "sin": result = Math.sin(Math.toRadians(first)); break; // Degrees mein
            case "cos": result = Math.cos(Math.toRadians(first)); break;
            case "tan": result = Math.tan(Math.toRadians(first)); break;
            case "log":
                if (first <= 0) throw new ArithmeticException("Invalid input for log");
                result = Math.log10(first);
                break;
            case "ln":
                if (first <= 0) throw new ArithmeticException("Invalid input for ln");
                result = Math.log(first);
                break;
            case "exp": result = Math.exp(first); break;

            default:
                throw new IllegalArgumentException("Invalid operation: " + operation);
        }

        // Round to 10 decimal places
        result = Math.round(result * 1e10) / 1e10;

        CalculationHistory history = new CalculationHistory(first, secondValue, op, result);
        return repository.save(history);
    }

    public List<CalculationHistory> getHistory() {
        return repository.findTop50ByOrderByCreatedAtDesc(); // Top 50 history
    }

    public void clearHistory() {
        repository.deleteAll();
    }
}