# LegacyLink

LegacyLink is a platform that allows users to store final messages for their loved ones in case of an uncertain demise. It provides a secure and private way to ensure that these messages are delivered as intended.

## Live App

You can access the live application at [https://legacylink.online/](https://legacylink.online/)

## Features (In Progress)

- **Secure Storage**: Users can create an account and store a list of people along with personalized messages. The data is securely stored and accessible only with a password.
  
- **Private Profiles**: Each user has a private profile with a unique password, ensuring that their messages are kept confidential and accessible only to trusted individuals.

- **Password Recovery**: In the event of a user's passing without sharing their password, a request can be made to remove the password from their profile. This process is carefully verified to ensure authenticity.

- **Selective Message Visibility**: Users can control the visibility of their messages. They can choose which messages they want to show publicly and which they want to keep private. For an added layer of security, users can protect their private messages with an additional password. This password will need to be entered correctly in order to access the message. Users can also choose to hide the names associated with their messages. These names will only be accessible when the correct full name is entered, along with the separate password if one is set.

## How It Works

1. **Create an Account**: Users sign up for an account on the LegacyLink platform.
   
2. **Add Recipients**: Users can add individuals to their list along with personalized messages.
   
3. **Secure Storage**: Messages are securely stored in private profiles accessible only with a password.
   
4. **Password Management**: Users are responsible for managing and safeguarding their profile password. They can choose to share it with trusted individuals or store it in a safe place.

5. **Password Recovery**: In the event of the user's passing, a trusted individual or family member can request the removal of the password from their profile. This request undergoes thorough verification to ensure authenticity before access is granted.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed the latest version of [Node.js and npm](https://nodejs.org/en/download/).
* You have a Windows/Mac/Linux machine.
* You have installed [MongoDB](https://www.mongodb.com/try/download/community). If you're using a Mac, you can install MongoDB with Homebrew:

    1. Open your terminal.
    2. If you haven't installed Homebrew, install it by running: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
    3. Update Homebrew: `brew update`
    4. Install MongoDB: `brew tap mongodb/brew` and then `brew install mongodb-community`
    5. To start MongoDB, run: `brew services start mongodb-community`

## Local Deployment

To deploy the app locally, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Create .env file using example.env as the base.
4. Run `npm install` to install the necessary dependencies.
5. Run `node index.js` to start the application.

## Documentation

For more detailed information about how to use LegacyLink, check out our [Wiki](https://github.com/sharmalakshay/LegacyLink/wiki).

## Contributing

Contributions are welcome! If you have any suggestions, ideas, or want to report a bug, please [open an issue](https://github.com/sharmalakshay/LegacyLink/issues) or [submit a pull request](https://github.com/sharmalakshay/LegacyLink/pulls).

## License

This project is licensed under the [MIT License](LICENSE).