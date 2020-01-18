package com.example;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

public class Job implements Serializable {

    private String title;
    private int amount;
    private Date createDate;
    private String creator;
    private String executor;
    private Date executionDate;

    public Job(@JsonProperty("text") String title,
               @JsonProperty("amount") int amount) {
        this.title = title;
        this.amount = amount;
        this.createDate = new Date();
        try {
            this.creator = InetAddress.getLocalHost().getHostName();
        } catch(UnknownHostException e) {
            this.creator = "Unknown Host";
        }
    }

    public String getTitle() {
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getAmount() {
        return this.amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getExecutor() {
        return executor;
    }

    public void setExecutor(String executor) {
        this.executor = executor;
    }

    public Date getExecutionDate() {
        return executionDate;
    }

    public void setExecutionDate(Date executionDate) {
        this.executionDate = executionDate;
    }

    @Override
    public String toString() {
        return "Job { " +
                "title = " + this.title + " " +
                "amount = " + this.amount + " }";
    }
}
