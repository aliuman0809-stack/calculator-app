package com.example.calculatorbackend.controller;

import com.example.calculatorbackend.dto.CalculationRequest;
import com.example.calculatorbackend.entity.CalculationHistory;
import com.example.calculatorbackend.service.CalculatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calculator")
@CrossOrigin(origins = "*")
public class CalculatorController {

    @Autowired
    private CalculatorService service;

    @PostMapping("/calculate")
    public ResponseEntity<CalculationHistory> calculate(@RequestBody CalculationRequest request) {
        CalculationHistory result = service.calculate(
                request.getFirstNumber(),
                request.getSecondNumber(),
                request.getOperation()
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CalculationHistory>> getHistory() {
        return ResponseEntity.ok(service.getHistory());
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearHistory() {
        service.clearHistory();
        return ResponseEntity.ok(Map.of("message", "History cleared successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "calculator-backend"));
    }
}