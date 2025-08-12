# 🐾 PAWSitiveOps – Workspace Playbook

This playbook provides **step-by-step guidance** for creating and managing **AnythingLLM workspaces** for PAWSitiveOps.  
It ensures that all agents (Compliance Hound, Sam the Safety Dog, Operations Bulldog, etc.) are **consistent, reliable, and easy to maintain**.

---

## 📋 Table of Contents
1. [Workspace Naming Conventions](#workspace-naming-conventions)
2. [Agent Role Definitions](#agent-role-definitions)
3. [Retrieval Settings](#retrieval-settings)
4. [Document Ingestion Workflows](#document-ingestion-workflows)
   - Manual Upload
   - Automated via n8n
5. [Prompt Engineering Best Practices](#prompt-engineering-best-practices)
6. [Testing & Validation](#testing--validation)
7. [Maintenance & Updates](#maintenance--updates)

---

## 1️⃣ Workspace Naming Conventions

All workspaces should follow this pattern:
pawsops-{agent-name}

Examples:
- `pawsops-compliance-hound`
- `pawsops-safety-dog`
- `pawsops-operations-bulldog`

**Why?**
- Keeps the workspace list clean and searchable
- Prevents accidental overlap with unrelated workspaces
- Makes API routing predictable (`/api/ask/{workspace}`)

---

## 2️⃣ Agent Role Definitions

**Compliance Hound**
- Focus: Licensing, permits, regulatory compliance  
- Sources: State/county/city regulations, SOPs, inspection checklists  

**Sam the Safety Dog**
- Focus: Safety, sanitation, pet care SOPs  
- Sources: Training manuals, hazard protocols, safety checklists  

**Operations Bulldog**
- Focus: Daily operations, customer service, scheduling  
- Sources: Staff training docs, customer comms templates, workflows  

**Marketing Poodle** *(optional)*
- Focus: Social media, event marketing, copywriting  
- Sources: Brand guidelines, past campaigns, social media templates  

---

## 3️⃣ Retrieval Settings

Recommended default settings for PAWSitiveOps agents:
- **Retrieval method**: Vector search + hybrid (if available)
- **Max documents returned**: 5
- **Similarity threshold**: 0.78–0.82  
- **Include citations**: ✅ Yes
- **Rerank results**: ✅ Yes (if supported)

---

## 4️⃣ Document Ingestion Workflows

### 📥 Manual Upload
1. Open the target workspace in the AnythingLLM UI.
2. Click **Upload Document**.
3. Drag-and-drop PDF, DOCX, or TXT files.
4. Tag each file with a **version** and **category**.

**Example Tags:**
version:2025-01
category:inspection-checklist


### ⚡ Automated via n8n
1. Trigger: File uploaded to a source folder (Dropbox, SharePoint, etc.).
2. n8n Workflow:
   - Download file  
   - Convert to text/PDF if needed  
   - Call AnythingLLM `/ingest` API for the target workspace  
   - Log upload and notify Slack/Teams

**Benefits:**
- Eliminates manual steps
- Ensures docs are always up-to-date
- Keeps ingestion logs for audits

---

## 5️⃣ Prompt Engineering Best Practices

When creating or editing system prompts for agents:
- Keep **role instructions clear and focused** (1–2 paragraphs)
- Use **bullet points** for capabilities and limitations
- Include **source citation instructions**
- Avoid embedding long policies — instead, ensure docs are ingested and retrievable

**Example System Prompt (Compliance Hound):**
You are Compliance Hound, a regulatory compliance assistant for pet and veterinary centers.
You always provide answers with the most relevant citations and links to official documents.
If you are unsure, clearly state what additional information is needed.


---

## 6️⃣ Testing & Validation

**Test Scenarios**
- Ask known-answer questions to verify retrieval accuracy
- Test ambiguous questions to ensure the agent requests clarification
- Check that citations link to correct documents
- Validate that irrelevant docs are not retrieved

**Frequency**
- Test **after any ingestion update**
- Test **monthly** as part of maintenance

---

## 7️⃣ Maintenance & Updates

**Monthly Tasks**
- Remove outdated docs
- Re-ingest updated SOPs, regulations, or guidelines
- Review agent prompts for accuracy and clarity
- Verify workspace retrieval settings

**Quarterly Tasks**
- Audit all ingested docs for completeness and relevance
- Update this playbook if workflows change
- Rotate API keys if required for security

---

## 📌 Version Control for Workspaces

To avoid losing prompt changes or retrieval settings:
- Export workspace configs periodically (if supported)
- Store in a private GitHub repo or secure drive
- Commit updates alongside documentation changes

---

## 📞 Support

For help with PAWSitiveOps workspaces, contact:  
- **Lead Maintainer**: Jesse Boudreau  
- **Email**: jesse.boudreau.dev@gmail.com 

---

