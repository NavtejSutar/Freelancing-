package com.freelancing.dto.request;

import lombok.Data;

@Data
public class ClientProfileRequest {
    private String industry;
    private String website;
    private String city;
    private String country;
}
