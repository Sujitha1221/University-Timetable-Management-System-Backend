# University Timetable Management System 📚

### Description

This Node.js backend manages university timetables with role-based logins for students, faculty, and admins. Admins handle user, course, timetable, room, and booking management to prevent conflicts. Students enroll in courses, view details and timetables, receiving notifications for changes. Faculty view assigned courses and timetables, also receiving notifications. Built on Express.js and MongoDB with added dependencies for security, testing, and logging.

### Features

- User Registration
- User Login
- Authentication with JSON Web Tokens (JWT)
- Role-based Access Control (RBAC)
- Logging with Winston and Express-Winston
- Unit Testing with Jest
- Integration Testing with Supertest
- Security Testing with OWASP ZAP
- Performance Testing with Artillery.io

### Installation

This system requires [Node.js](https://nodejs.org/) to run.

1. Clone the Repository:

```sh
git clone https://github.com/sliitcsse/assignment-01-Sujitha1221.git
```

2. Install Dependencies:

```sh
npm install
```

3. Configure Environment Variables:

- Create a .env file in the root directory.
- Define the following environment variables:

```sh
PORT=8090
MONGODB_URL=<MongoDB_Connection_String>
JWT_SECRET=<JWT_Secret_Key>
```

4. Database Setup:

- Ensure MongoDB is installed and running.
- Replace <MongoDB_Connection_String> with your MongoDB connection string.

5. Run the Application

```sh
npm run dev
```

Voila!🎉 Now you are all set to use the University Timetable Management System backend app 😊

### Testing

1. Unit Testing with Jest:
   Unit test cases are under "unitTesting" folder. To run the test, simply you have to give the command as below.

```sh
npm test <Unit-test-file-name>.test.js
```

2. Integration Testing with Supertest:
   Integration test cases are under "integrationTesting folder". To run the test, simply you have to give the command as below.

```sh
npm test <Integration-test-file-name>.test.js
```

3. Security Testing with OWASP ZAP:
   To utilize OWASP ZAP for security testing, you must download the appropriate version for your machine from [Download ZAP](https://www.zaproxy.org/download/). Refer to [OWASP ZAP documentation](https://www.zaproxy.org/docs/) for instructions.
   The already completed security test report is available in the "securityTesting" folder for reference.

4. Performance Testing with Artillery.io:
   To use Artillery for performace testing, you have to install in your machine

```sh
npm install -g artillery
```

Performnace testong test cases are located under the "performancetesting" folder. To run the tests, simply execute the command below:

```sh
artillery run <test_file_name>.yaml
```

After the test case is executed, you will receive a JSON file. To generate the HTML report, you can use the created JSON file:

```sh
artillery report <test_file_name>.json
```

You will receive an HTML file where you can view the details of the API calls and their security level.

Already created JSON files and reports are available in the "integrationTesting" folder itself for your reference.

### API Documentation

The [API documentation](https://github.com/sliitcsse/assignment-01-Sujitha1221/blob/main/ApiDocumentation.json) is available as ApiDocumentation.json in the folder.

### Contributing

Contributions are welcome! Please follow the standard guidelines:

- Fork the repository.
- Create a new branch (git checkout -b feature/new-feature).
- Commit your changes (git commit -am 'Add new feature').
- Push to the branch (git push origin feature/new-feature).
- Create a new Pull Request.

Happy Coding 😊 
