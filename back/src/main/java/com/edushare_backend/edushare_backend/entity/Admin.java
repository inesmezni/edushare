package com.edushare_backend.edushare_backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("ADMIN")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Admin extends Utilisateurs {

    private String adminLevel = "STANDARD";

   
    public Admin(String name, String email, String password) {
        super();
        this.setName(name);
        this.setEmail(email);
        this.setPassword(password);
        this.setRole(Role.ADMIN);
    }
}