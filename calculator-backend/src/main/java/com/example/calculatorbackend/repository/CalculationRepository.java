package com.example.calculatorbackend.repository;

import com.example.calculatorbackend.entity.CalculationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalculationRepository extends JpaRepository<CalculationHistory, Long> {
    List<CalculationHistory> findTop10ByOrderByCreatedAtDesc();
}