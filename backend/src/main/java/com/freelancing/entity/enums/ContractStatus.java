package com.freelancing.entity.enums;
 
public enum ContractStatus {
    PENDING_ACCEPTANCE, // ADDED: contract created, waiting for both parties to accept
    ACTIVE,
    PAUSED,
    COMPLETED,
    TERMINATED,
    DISPUTED
}