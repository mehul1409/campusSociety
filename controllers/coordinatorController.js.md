# Internal Code Documentation: Coordinator API

## Table of Contents

* [1. Introduction](#1-introduction)
* [2. Modules and Dependencies](#2-modules-and-dependencies)
* [3. Functions](#3-functions)
    * [3.1. `getEventsByCoordinator(req, res)`](#31-geteventsbycoordinatorreq-res)
    * [3.2. `getEventById(req, res)`](#32-geteventiddreq-res)
    * [3.3. `editEvent(req, res)`](#33-editeventreq-res)
    * [3.4. `deleteEvent(req, res)`](#34-deleteeventreq-res)
    * [3.5. `changePassword(req, res)`](#35-changepasswordreq-res)
    * [3.6. `postEvent(req, res)`](#36-posteventreq-res)
    * [3.7. `coordinatorLogin(req, res)`](#37-coordinatorloginreq-res)
    * [3.8. `getAllCoordinators(req, res)`](#38-getallcoordinatorsreq-res)
    * [3.9. `updateCoordinator(req, res)`](#39-updatecoordinatorreq-res)
    * [3.10. `deleteCoordinator(req, res)`](#310-deletecoordinatorreq-res)
    * [3.11. `requestPasswordReset(req, res)`](#311-requestpasswordresetreq-res)
    * [3.12. `resetPassword(req, res)`](#312-resetpasswordreq-res)


<a name="1-introduction"></a>
## 1. Introduction

This document details the functionality of the Coordinator API, outlining each function's purpose, algorithm, and error handling.  The API uses various models (`Coordinator`, `Hub`, `Event`) and helper functions (`sendEmail`) for data management and communication.


<a name="2-modules-and-dependencies"></a>
## 2. Modules and Dependencies

The API utilizes the following modules:

| Module           | Purpose                                      |
|-------------------|----------------------------------------------|
| `../models/coordinator.js` | Coordinator data model                     |
| `bcryptjs`        | Password hashing                            |
| `jsonwebtoken`   | JSON Web Token generation and verification |
| `../models/hub.js`      | Hub data model                              |
| `../models/event.js`     | Event data model                             |
| `../helpers/sendEmail.js` | Email sending helper function              |


<a name="3-functions"></a>
## 3. Functions

<a name="31-geteventsbycoordinatorreq-res"></a>
### 3.1. `getEventsByCoordinator(req, res)`

This function retrieves all events associated with a specific coordinator.

* **Input:** `req.body.coordinatorId` (Coordinator ID)
* **Output:** 
    * `200 OK`: JSON array of events if found.
    * `404 Not Found`: JSON object indicating no events found for the given coordinator ID.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts the `coordinatorId` from the request body.
    2. Uses `Event.find({ postedBy: coordinatorId })` to query the database for events where `postedBy` matches the provided `coordinatorId`.
    3. Returns the events in a JSON response if found, otherwise returns a 404 error.
    4. Handles potential errors during database interaction and returns a 500 error if necessary.


<a name="32-geteventiddreq-res"></a>
### 3.2. `getEventById(req, res)`

This function retrieves a single event by its ID.

* **Input:** `req.params.eventId` (Event ID)
* **Output:**
    * `200 OK`: JSON object containing the event details.
    * `404 Not Found`: JSON object indicating the event was not found.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts the `eventId` from the request parameters.
    2. Uses `Event.findById(eventId)` to query the database for the event.
    3. Returns the event in a JSON response if found, otherwise returns a 404 error.
    4. Handles potential errors during database interaction and returns a 500 error if necessary.


<a name="33-editeventreq-res"></a>
### 3.3. `editEvent(req, res)`

This function updates an existing event.  Only fields provided in `eventDetails` are updated; others remain unchanged.

* **Input:** `req.body.eventId` (Event ID), `req.body.eventDetails` (Object containing updated event details)
* **Output:**
    * `200 OK`: JSON object indicating success and containing the updated event.
    * `404 Not Found`: JSON object indicating the event was not found.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts the `eventId` and `eventDetails` from the request body.
    2. Uses `Event.findById(eventId)` to find the event to update.
    3. Updates the event's `eventDetails` using the values provided in `req.body.eventDetails`, only overwriting fields explicitly provided.
    4. Saves the updated event using `event.save()`.
    5. Returns the updated event in a JSON response if successful, otherwise returns a 404 or 500 error.


<a name="34-deleteeventreq-res"></a>
### 3.4. `deleteEvent(req, res)`

This function deletes an event by its ID.

* **Input:** `req.body.eventId` (Event ID)
* **Output:**
    * `200 OK`: JSON object indicating successful deletion.
    * `404 Not Found`: JSON object indicating the event was not found.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts the `eventId` from the request body.
    2. Uses `Event.findByIdAndDelete(eventId)` to delete the event from the database.
    3. Returns a success message if the event was deleted, otherwise returns a 404 error.
    4. Handles potential errors during database interaction and returns a 500 error if necessary.


<a name="35-changepasswordreq-res"></a>
### 3.5. `changePassword(req, res)`

This function allows a coordinator to change their password.

* **Input:** `req.body.email` (Coordinator email), `req.body.currentPassword` (Current password), `req.body.newPassword` (New password)
* **Output:**
    * `200 OK`: JSON object indicating successful password change.
    * `404 Not Found`: JSON object indicating the coordinator was not found.
    * `400 Bad Request`: JSON object indicating incorrect current password.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts email, current password, and new password from the request body.
    2. Finds the coordinator using `Coordinator.findOne({ email })`.
    3. Uses `bcrypt.compare()` to verify the current password.
    4. If the current password matches, hashes the new password using `bcrypt.hash()` and updates the coordinator's password in the database.
    5. Returns a success message if the password was changed, otherwise returns appropriate error messages.



<a name="36-posteventreq-res"></a>
### 3.6. `postEvent(req, res)`

This function creates a new event.

* **Input:** `req.body.coordinatorId` (Coordinator ID), `req.body.eventDetails` (Event details)
* **Output:**
    * `201 Created`: JSON object indicating successful creation and including the new event's ID.
    * `404 Not Found`: JSON object indicating the hub was not found for the given coordinator ID.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts coordinator ID and event details from the request body.
    2. Finds the associated Hub using `Hub.findOne({ coordinatorId })`.
    3. Creates a new `Event` object with the provided details, including the hub ID and coordinator ID.
    4. Saves the new event to the database using `newEvent.save()`.
    5. Adds the new event's ID to the hub's `events` array and saves the hub.
    6. Returns the new event's ID in a JSON response.


<a name="37-coordinatorloginreq-res"></a>
### 3.7. `coordinatorLogin(req, res)`

This function handles coordinator login.

* **Input:** `req.body.email` (Coordinator email), `req.body.password` (Coordinator password)
* **Output:**
    * `200 OK`: JSON object containing a JWT (JSON Web Token) and coordinator information.  A cookie named 'coordinatortoken' containing the JWT is also set.
    * `401 Unauthorized`: JSON object indicating invalid credentials.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts email and password from the request body.
    2. Finds the coordinator using `Coordinator.findOne({ email }).populate('collegeId').populate('hubId')`.
    3. Verifies the password using `bcrypt.compare()`.
    4. If credentials are valid, generates a JWT using `jwt.sign()` and sets it as an HttpOnly cookie.
    5. Returns the token, coordinator information, and role in the JSON response.


<a name="38-getallcoordinatorsreq-res"></a>
### 3.8. `getAllCoordinators(req, res)`

This function retrieves all coordinators. Requires a custom header for authorization.

* **Input:** `req.headers['access-token']` (Authorization header)
* **Output:**
    * `200 OK`: JSON array of all coordinators.
    * `500 Internal Server Error`:  JSON object indicating invalid header or server error.
* **Algorithm:**
    1. Checks for the existence of the `access-token` header.
    2. Verifies the header value against `process.env.accessToken`.
    3. If valid, retrieves all coordinators using `Coordinator.find()`.
    4. Returns coordinators in JSON format if successful, otherwise returns a 500 error.


<a name="39-updatecoordinatorreq-res"></a>
### 3.9. `updateCoordinator(req, res)`

This function updates coordinator details. Requires a custom header for authorization.

* **Input:** `req.body.name`, `req.body.email`, `req.body.password` (Coordinator details to update), `req.params.coordinatorId` (ID of the coordinator to update), `req.headers['access-token']` (Authorization header)
* **Output:**
    * `200 OK`: JSON object confirming successful update.
    * `404 Not Found`: JSON object indicating the coordinator was not found.
    * `500 Internal Server Error`: JSON object indicating invalid header or server error.
* **Algorithm:**
    1. Checks for the existence and validity of the `access-token` header.
    2. Finds the coordinator using `Coordinator.findById(coordinatorId)`.
    3. Updates only the fields provided in the request body. If a password is provided, it is hashed using `bcrypt.hash()`.
    4. Saves the updated coordinator using `coordinator.save()`.
    5. Returns a success message if the update was successful, otherwise returns appropriate error messages.


<a name="310-deletecoordinatorreq-res"></a>
### 3.10. `deleteCoordinator(req, res)`

This function deletes a coordinator. Requires a custom header for authorization.

* **Input:** `req.params.coordinatorId` (ID of the coordinator to delete), `req.headers['access-token']` (Authorization header)
* **Output:**
    * `200 OK`: JSON object confirming successful deletion.
    * `404 Not Found`: JSON object indicating the coordinator was not found.
    * `500 Internal Server Error`: JSON object indicating invalid header or server error.
* **Algorithm:**
    1. Checks for the existence and validity of the `access-token` header.
    2. Finds the coordinator using `Coordinator.findById(coordinatorId)`.
    3. Deletes the coordinator using `Coordinator.findByIdAndDelete(coordinatorId)`.
    4. Returns a success message if the deletion was successful, otherwise returns appropriate error messages.


<a name="311-requestpasswordresetreq-res"></a>
### 3.11. `requestPasswordReset(req, res)`

This function sends a password reset link to the coordinator's email.

* **Input:** `req.body.email` (Coordinator email), `req.body.role` (Coordinator role).
* **Output:**
    * `200 OK`: JSON object indicating the password reset link was sent.
    * `404 Not Found`: JSON object indicating the coordinator was not found.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts email and role from the request body.
    2. Finds the coordinator using `Coordinator.findOne({ email })`.
    3. Generates a JWT using `jwt.sign()`.
    4. Creates a reset link using the JWT and role.
    5. Sends an email containing the reset link using `sendEmail()`.
    6. Returns a success message if the email was sent.


<a name="312-resetpasswordreq-res"></a>
### 3.12. `resetPassword(req, res)`

This function allows a coordinator to reset their password using a token.

* **Input:** `req.body.token` (JWT token), `req.body.newPassword` (New password)
* **Output:**
    * `200 OK`: JSON object indicating successful password update.
    * `400 Bad Request`: JSON object indicating an invalid or expired token.
    * `404 Not Found`: JSON object indicating the coordinator was not found.
    * `500 Internal Server Error`: JSON object indicating a server error.
* **Algorithm:**
    1. Extracts the token and new password from the request body.
    2. Verifies the JWT using `jwt.verify()`.
    3. If the token is valid, finds the coordinator using `Coordinator.findById(decoded.userId)`.
    4. Hashes the new password using `bcrypt.hash()`.
    5. Updates the coordinator's password and saves the changes.
    6. Returns a success message if the password was updated.

