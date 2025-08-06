package com.example.payflow_backend.service;

import com.example.payflow_backend.model.CTC;
import com.example.payflow_backend.model.CTCHistory;
import com.example.payflow_backend.model.CTCHistory.CTCActionType;
import com.example.payflow_backend.repository.CTCHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CTCHistoryService {

    @Autowired
    private CTCHistoryRepository ctcHistoryRepository;

    /**
     * Save CTC history when CTC is created
     */
    public CTCHistory saveCTCCreated(CTC ctc, String createdBy) {
        return saveCTCHistory(ctc, CTCActionType.CREATED, createdBy, "Initial CTC creation");
    }

    /**
     * Save CTC history when CTC is updated
     */
    public CTCHistory saveCTCUpdated(CTC ctc, String createdBy) {
        return saveCTCHistory(ctc, CTCActionType.UPDATED, createdBy, "CTC updated");
    }

    /**
     * Save CTC history when CTC is deactivated
     */
    public CTCHistory saveCTCDeactivated(CTC ctc, String createdBy) {
        return saveCTCHistory(ctc, CTCActionType.DEACTIVATED, createdBy, "CTC deactivated");
    }

    /**
     * Save CTC history for salary revision
     */
    public CTCHistory saveCTCRevision(CTC ctc, String createdBy, String remarks) {
        return saveCTCHistory(ctc, CTCActionType.REVISION, createdBy, 
                             remarks != null ? remarks : "Salary revision");
    }

    /**
     * Generic method to save CTC history
     */
    public CTCHistory saveCTCHistory(CTC ctc, CTCActionType actionType, String createdBy, String remarks) {
        CTCHistory history = CTCHistory.fromCTC(ctc, actionType, createdBy, remarks);
        return ctcHistoryRepository.save(history);
    }

    /**
     * Get all CTC history for an employee
     */
    public List<CTCHistory> getCTCHistoryByEmployeeId(Long employeeId) {
        return ctcHistoryRepository.findByEmployeeEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    /**
     * Get CTC history by CTC ID
     */
    public List<CTCHistory> getCTCHistoryByCtcId(Long ctcId) {
        return ctcHistoryRepository.findByCtcCtcIdOrderByCreatedAtDesc(ctcId);
    }

    /**
     * Get CTC history by action type
     */
    public List<CTCHistory> getCTCHistoryByActionType(CTCActionType actionType) {
        return ctcHistoryRepository.findByActionTypeOrderByCreatedAtDesc(actionType);
    }

    /**
     * Get CTC history for an employee within a date range
     */
    public List<CTCHistory> getCTCHistoryByEmployeeIdAndDateRange(Long employeeId, 
                                                                  LocalDateTime startDate, 
                                                                  LocalDateTime endDate) {
        return ctcHistoryRepository.findByEmployeeIdAndDateRange(employeeId, startDate, endDate);
    }

    /**
     * Get latest CTC history record for an employee
     */
    public CTCHistory getLatestCTCHistoryByEmployeeId(Long employeeId) {
        return ctcHistoryRepository.findLatestByEmployeeId(employeeId);
    }

    /**
     * Count CTC changes for an employee
     */
    public long countCTCChangesByEmployeeId(Long employeeId) {
        return ctcHistoryRepository.countByEmployeeEmployeeId(employeeId);
    }

    /**
     * Get CTC history by creator
     */
    public List<CTCHistory> getCTCHistoryByCreatedBy(String createdBy) {
        return ctcHistoryRepository.findByCreatedByOrderByCreatedAtDesc(createdBy);
    }
}
