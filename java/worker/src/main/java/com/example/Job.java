package com.example;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

public class Job implements Serializable {

    private final String title;
    private final int amount;

    public Job(@JsonProperty("text") String title,
               @JsonProperty("amount") int amount) {
        this.title = title;
        this.amount = amount;
    }

    public String getTitle() {
        return this.title;
    }

    public int getAmount() {
        return this.amount;
    }

    @Override
    public String toString() {
        return "Job { " +
                "title = " + this.title + " " +
                "amount = " + this.amount + " }";
    }
}
