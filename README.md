# Musanze Safe Market Field Inspection Prototype

**Course:** SWE 3409 Mobile Application Development  
**Institution:** Institut d'Enseignement Supérieur de Ruhengeri (INES-Ruhengeri)  
**Assignment:** Assignment 1 - Scenario-based React Native and Expo Group Project  

## 📋 Group & Submission Details

| Requirement | Details |
| :--- | :--- |
| **Group Number** | [e.g., 04] |
| **Group Verification Code** | [e.g., MOB-G04-1234] |
| **Group Leader** | [Name & Registration Number] |
| **Group Members & Roles** | 1. [Name] – Product and UX lead<br>2. [Name] – Interface engineer<br>3. [Name] – State and navigation engineer<br>4. [Name] – Device integration and QA lead<br>5. [Name] – Release and evidence lead |
| **GitHub Repository URL** | [Insert GitHub Link] |
| **Final Commit Hash** | [Insert Final Commit Hash] |
| **Demonstration Video** | Included in `/evidence/MOB_A1_GXX_DEMO.mp4` (or insert link) |

---

## 📱 Project Overview

This is a fictional field inspection application built for the "Musanze Safe Markets" one-day pilot program. It allows field officers to view assigned market zones, record fictional vendor inspections with validated inputs, capture evidence via the device camera or gallery, and review/save the inspection to an in-memory session list. 

**Technical Stack:**
- **Framework:** React Native with Expo (SDK 57)
- **Language:** TypeScript
- **Navigation:** React Navigation (Bottom Tabs & Native Stack)
- **State Management:** React Context API (In-memory session)
- **Device Integration:** Expo Image Picker & Expo Image Manipulator

---

## 🛠️ Prerequisites & Environment Setup

To run this project, the assessor or user must have the following installed on their machine:

### 1. Install Node.js, npm, and npx
Node.js is the JavaScript runtime required to run the Expo development server. `npm` (Node Package Manager) and `npx` (Node Package Execute) are bundled with it.
1. Go to the [Node.js Official Website](https://nodejs.org/).
2. Download and install the **LTS (Long Term Support)** version for your operating system (Windows, macOS, or Linux).
3. Follow the installation wizard (ensure "Add to PATH" is checked).
4. Verify the installation by opening your terminal/command prompt and running:
   ```bash
   node -v
   npm -v
   npx -v