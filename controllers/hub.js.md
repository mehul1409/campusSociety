# Internal Code Documentation: Hub API

## Table of Contents

* [1. Introduction](#1-introduction)
* [2. Modules](#2-modules)
* [3. Functions](#3-functions)
    * [3.1 `getAllHubs(req, res)`](#31-getAllHubsreq-res)
    * [3.2 `updateHub(req, res)`](#32-updateHubreq-res)
    * [3.3 `deleteHub(req, res)`](#33-deleteHubreq-res)


## 1. Introduction

This document details the functionality of the Hub API, which provides endpoints for managing hub data.  The API utilizes a Node.js framework and interacts with a MongoDB database via Mongoose models.  Caching is implemented using `node-cache` to improve performance.


## 2. Modules

| Module           | Description                                         |
|-------------------|-----------------------------------------------------|
| `../models/hub`  | Mongoose model for Hub documents.                   |
| `../models/college` | Mongoose model for College documents.                |
| `../models/coordinator` | Mongoose model for Coordinator documents.             |
| `node-cache`      | Node.js caching module used for in-memory caching. |


## 3. Functions

### 3.1 `getAllHubs(req, res)`

This function retrieves all hubs from the database. It implements caching to improve performance.

**Algorithm:**

1. **Authentication:** Checks if an `access-token` is provided in the request header.  If not, it returns a 400 error.  It then verifies if the provided token matches the `process.env.accessToken`. If not, it returns a 403 error.

2. **Caching:** Checks if hubs are already cached using `nodecache.has('hubs')`.
   - If cached, retrieves and parses the JSON data from the cache.
   - If not cached, fetches all hubs from the database using `Hub.find().populate('collegeId').populate('coordinatorId').populate('events')`.  The `.populate()` methods ensure that related data (college, coordinator, and events) are included in the results.  The data is then stored in the cache using `nodecache.set('hubs', JSON.stringify(hubs))`.

3. **Response:** Returns the hubs data (either from cache or database) with a 200 status code.

4. **Error Handling:** Catches any errors during database access and returns a 500 error.


### 3.2 `updateHub(req, res)`

This function updates an existing hub in the database.

**Algorithm:**

1. **Authentication:**  Similar to `getAllHubs`, it checks for and verifies the `access-token`. Returns 400 or 403 errors if authentication fails.

2. **Data Retrieval:** Retrieves the hub and coordinator using their respective IDs (`hubId` and `coordinatorId`) from the request parameters and body. Returns a 404 error if either is not found.

3. **Update:** Updates the hub fields (`hubName`, `collegeId`, `coordinatorId`) if provided in the request body. If `coordinatorName` is provided, it updates the associated coordinator's name and saves the changes. Finally, it saves the updated hub.

4. **Response:** Returns a 200 status code with a success message.

5. **Error Handling:** Catches and handles errors during database operations, returning a 500 error.


### 3.3 `deleteHub(req, res)`

This function deletes a hub from the database.  Note that a commented-out version of this function (previously included in the code) provides more comprehensive deletion functionality.


**Algorithm (current implementation):**

1. **Authentication:** Checks for and verifies the `access-token`. Returns 400 or 403 errors if authentication fails.

2. **Hub Deletion:** Finds the hub by ID and deletes it using `Hub.findByIdAndDelete(hubId)`. Returns a 404 error if the hub is not found.

3. **Response:** Returns a 200 status code with a success message.

4. **Error Handling:** Catches and handles errors during database operations, returning a 500 error.


**Algorithm (commented-out, more comprehensive implementation):**

This commented-out version performs additional actions before deleting the hub:

1. **Authentication:**  Same as the current implementation.

2. **Hub Retrieval:** Retrieves the hub using its ID. Returns a 404 error if not found.

3. **College Update:** Removes the hub ID from the `hubs` array in the `College` schema using `College.updateMany` and the `$pull` operator. Logs the number of colleges updated.

4. **Coordinator Deletion:** Deletes the coordinator associated with the hub using `Coordinator.findOneAndDelete`. Logs whether the coordinator was found and deleted.

5. **Hub Deletion:** Deletes the hub from the `Hub` schema.

6. **Response:** Returns a 200 status code with a success message.

7. **Error Handling:** Catches and handles errors during database operations, returning a 500 error.  This more comprehensive approach ensures data consistency across related schemas.
