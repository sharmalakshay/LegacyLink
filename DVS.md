# LegacyLink Demise Verification System (DVS)

## User Settings for Demise Verification System

### Frequency of Vital Check
- **Description:** A basic check to determine if the user is alive.
- **Options:** Daily, Weekly, Monthly, Custom

### Connected Vitals
- **Description:** Social media accounts where the user may be active.
- **Options:** Facebook, Twitter, Instagram, LinkedIn, Custom

### Inactivity Period Before DVS Should Be Triggered
- **Description:** Duration of inactivity before Demise Verification System (DVS) is initiated.
- **Example:** If no new post is detected in the last 30 days, trigger DVS.
- **Options:** 15 days, 30 days, 60 days, Custom

### Method of Demise Verification (DV)
- **Description:** The approach used to verify the user's demise.
- **Options:**
    - Contact nominee from LegacyLink
    - Contact nominee anonymously (e.g., calling from [XYZ company], asking to speak to [User's Full Name])
    - Custom instructions (user-provided)

### Action in Case of Demise Verification Failure
- **Description:** The action to take if LegacyLink cannot definitively verify the user's status.
- **Note:** DVS is a manual process, and we strive to provide a definite answer. If the person has not passed, Demise Verification should result in a false, and the profile should not be unlocked.
- **Options:**
    - Unlock profile
    - Do not unlock profile

### Privacy After Demise Settings
- **Description:** Determine which names and messages should be made visible after profile unlock.
- **Categories:**
    - Show to All: Names and messages are shown to everyone.
    - Show Name to All, Message with Second Password: Names are shown to everyone, but messages require a second password. This is managed with keys (one key can unlock multiple but not necessarily all names).
    - Hidden Name and Message: Names and messages are hidden and only shown by entering a key in an input field (a key can unlock any number of hidden names and messages).

**User Actions:** Users can create keys and assign them to names from the homepage.

### Triggering Demise Verification
- **Request Form:** DV can be triggered by filling out a request form on the website.

### Handling Incomplete DV Settings
- If DV is requested and the settings are incomplete, the notifier may be asked for an official document to verify the demise.

## Post-Demise Actions
- Once DV confirms the user's passing, the profile will be unlocked.
- An unlocked profile will display names and messages according to the user's privacy settings.

## Special Cases
- If a user loses access to their LegacyLink and email accounts, and the profile is unlocked via DVS, they can request to lock or delete the profile.
- In such cases, the user must verify both their identity and provide a custom proof of life at the time of request.