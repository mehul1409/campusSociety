# Internal Code Documentation

## Table of Contents

* [1. Introduction](#1-introduction)
* [2. `assignSpoc` Function](#2-assignspoc-function)
* [3. `adminLogin` Function](#3-adminlogin-function)
* [4. `adminRegister` Function](#4-adminregister-function)
* [5. `getAllAdmins` Function](#5-getalladmins-function)
* [6. `updateAdmin` Function](#6-updateadmin-function)
* [7. `deleteAdmin` Function](#7-deleteadmin-function)


<a name="1-introduction"></a>
## 1. Introduction

This document details the functionality of the backend API endpoints related to admin and SPOC management.  The code utilizes several Node.js modules including:

* `College`, `Spoc`, and `Admin`: Mongoose models for database interaction.
* `crypto`: For generating random passwords.
* `bcrypt`: For password hashing and comparison.
* `jsonwebtoken`: For JWT authentication.
* `nodemailer`: For sending emails.


<a name="2-assignspoc-function"></a>
## 2. `assignSpoc` Function

This function assigns a new SPOC (Single Point of Contact) to a college.  It generates a random password, hashes it using bcrypt, creates a new SPOC user, updates the college record, and sends a notification email to the new SPOC.

**Algorithm:**

1. **Retrieve College:** Fetches the college from the database using the provided `collegeId`.  Returns a 404 error if the college is not found.
2. **Check for Existing SPOC:** Verifies if a SPOC is already assigned to the college. Returns a 400 error if one exists.
3. **Generate and Hash Password:** Generates a random 8-character password using `crypto.randomBytes` and hashes it using `bcrypt.hash` with a salt round of 10.
4. **Create New SPOC:** Creates a new `Spoc` document with the received data and the hashed password.
5. **Save SPOC and Update College:** Saves the new SPOC to the database and updates the `spocId` field of the corresponding college document.
6. **Send Email:** Uses `nodemailer` to send an email to the SPOC with their login credentials. Includes error handling for email sending.
7. **Return Response:** Returns a 201 status code with the newly created SPOC's ID, the generated password, and the email sending status.  Handles errors with a 500 status code.


<a name="3-adminlogin-function"></a>
## 3. `adminLogin` Function

This function handles admin login. It verifies the provided credentials against the database and generates a JWT token upon successful authentication.


**Algorithm:**

1. **Find Admin:** Retrieves the admin user from the database based on the provided email.
2. **Verify Password:** Compares the provided password with the hashed password in the database using `bcrypt.compare`.
3. **Generate JWT:** If the password matches, generates a JSON Web Token (JWT) using `jsonwebtoken.sign`.  The token includes the admin's ID and expires in 1 hour.
4. **Set Cookie:** Sets an `adminToken` HTTP-only cookie with the JWT.  The `secure` flag is set to `true` only in production to ensure the cookie is transmitted over HTTPS.
5. **Return Response:** Returns a 200 status code with a success message and the JWT.  Handles errors with a 500 status code.


<a name="4-adminregister-function"></a>
## 4. `adminRegister` Function

This function registers a new admin user. It hashes the password before saving the user to the database.

**Algorithm:**

1. **Check for Existing Admin:** Checks if an admin with the provided email already exists. Returns a 400 error if one exists.
2. **Hash Password:** Hashes the provided password using `bcrypt.hash` with a salt round of 10.
3. **Create and Save Admin:** Creates a new `Admin` document with the provided data and the hashed password, and saves it to the database.
4. **Return Response:** Returns a 201 status code with a success message.  Handles errors with a 500 status code.



<a name="5-getalladmins-function"></a>
## 5. `getAllAdmins` Function

This function retrieves all admin users. It requires a custom header, `access-token`, for authorization.

**Algorithm:**

1. **Check Header:** Verifies that the `access-token` header is present in the request. Returns a 500 error if missing.
2. **Authorize:** Checks if the `access-token` matches the value stored in the environment variable `process.env.accessToken`. Returns a 500 error if it does not match.
3. **Fetch Admins:** Retrieves all admin users from the database using `Admin.find()`.
4. **Return Response:** Returns a 200 status code with the list of admins.  Handles errors with a 500 status code.


<a name="6-updateadmin-function"></a>
## 6. `updateAdmin` Function

This function updates an existing admin user. It requires a custom header, `access-token`, for authorization.

**Algorithm:**

1. **Check Header:**  Verifies that the `access-token` header is present. Throws an error if missing.
2. **Find Admin:** Retrieves the admin user using the provided `adminId`. Returns a 404 error if not found.
3. **Authorize:** Checks if the `access-token` matches the value stored in the environment variable `process.env.accessToken`. Throws an error if it does not match.
4. **Update Admin:** Updates the admin's name, email, and/or password (if provided) and rehashes the password if necessary.
5. **Save Changes:** Saves the updated admin document to the database.
6. **Return Response:** Returns a 200 status code with a success message. Handles errors with a 500 status code.


<a name="7-deleteadmin-function"></a>
## 7. `deleteAdmin` Function

This function deletes an admin user. It requires a custom header, `access-token`, for authorization.

**Algorithm:**

1. **Check Header:** Verifies that the `access-token` header is present. Throws an error if missing.
2. **Authorize:** Checks if the `access-token` matches the value stored in the environment variable `process.env.accessToken`. Throws an error if it does not match.
3. **Find Admin:** Retrieves the admin user using the provided `adminId`. Returns a 404 error if not found.
4. **Delete Admin:** Deletes the admin user from the database using `Admin.findByIdAndDelete()`.
5. **Return Response:** Returns a 200 status code with a success message. Handles errors with a 500 status code.

