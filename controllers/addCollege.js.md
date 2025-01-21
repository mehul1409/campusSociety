# Internal Code Documentation: College API

[Linked Table of Contents](#linked-table-of-contents)

## Linked Table of Contents

* [1. Introduction](#1-introduction)
* [2. `addCollege` Function](#2-addcollege-function)
* [3. `getAllColleges` Function](#3-getallcolleges-function)
* [4. `updateCollege` Function](#4-updatecollege-function)
* [5. `deleteCollege` Function](#5-deletecollege-function)


## 1. Introduction

This document details the functionality of the four functions within the College API: `addCollege`, `getAllColleges`, `updateCollege`, and `deleteCollege`.  Each function interacts with a `college` model (assumed to be defined in `../models/college.js`), which manages college data.  All functions utilize asynchronous operations (`async/await`) for efficient handling of database interactions.  Authentication is implemented via a custom header named `access-token`.

## 2. `addCollege` Function

This function adds a new college to the database.

```javascript
const addCollege = async (req,res) => {
    try {
        const { collegeName, location } = req.body;
        const newCollege = new college({
            collegeName,
            location
        });
        const savedCollege = await newCollege.save();
        return res.status(201).json({
            message: 'College added successfully',
            collegeId: savedCollege._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
```

**Algorithm:**

1. Extracts `collegeName` and `location` from the request body (`req.body`).
2. Creates a new `college` instance using the extracted data.
3. Saves the new college instance to the database using `await newCollege.save()`.
4. Returns a 201 status code with the success message and the newly created college's ID.
5. Catches any errors during the process and returns a 500 status code with a generic server error message.


## 3. `getAllColleges` Function

This function retrieves all colleges from the database.  Access is restricted by an authentication header.

```javascript
const getAllColleges = async (req, res) => {
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        res.status(500).send('Headers not provided!');
      }

      if (customHeader === process.env.accessToken) {
        const colleges = await college.find();
        res.status(200).json(colleges);
      } else {
        res.status(500).send('Invalid Header value!');
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      res.status(500).send('Server error');
    }
  };
```

**Algorithm:**

1. Retrieves the `access-token` from the request headers.
2. Checks if the header is present. If not, returns a 500 error.
3. Verifies the header against the value stored in the environment variable `process.env.accessToken`.
4. If the header is valid, retrieves all colleges from the database using `college.find()`.
5. Returns a 200 status code with the array of colleges.
6. If the header is invalid, returns a 500 error.
7. Catches any errors and returns a 500 status code with a server error message.


## 4. `updateCollege` Function

This function updates an existing college in the database.  Access is controlled by an authentication header.


```javascript
const updateCollege = async (req, res) => {
    const { collegeName, location } = req.body;
    const { collegeId} = req.params;

    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        throw new Error('Header not provided!');
      }
      const collegedetail = await college.findById(collegeId);
      if (!collegedetail) {
        return res.status(404).json({ message: 'college not found' });
      }
      if (customHeader === process.env.accessToken) {
        if (collegeName) {
            collegedetail.collegeName = collegeName;
        }
        if (location) {
            collegedetail.location = location;
        }

        await collegedetail.save();

        return res.status(200).json({ message: 'college details updated successfully' });
      } else {
        throw new Error('Invalid header value!');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
```

**Algorithm:**

1. Extracts the `collegeId` from the request parameters (`req.params`) and  `collegeName` and `location` from the request body.
2. Retrieves the `access-token` from the request headers.  Returns a 500 error if missing.
3. Retrieves the college document from the database using `college.findById(collegeId)`. Returns a 404 error if not found.
4. Verifies the `access-token`. Returns a 500 error if invalid.
5. Updates the college document with the provided `collegeName` and `location` if they are present in the request body.
6. Saves the updated college document.
7. Returns a 200 status code with a success message.
8. Catches any errors and returns a 500 status code with a server error message.


## 5. `deleteCollege` Function

This function deletes a college from the database. Access is controlled by an authentication header.

```javascript
const deleteCollege = async (req, res) => {
    const { collegeId } = req.params;
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        throw new Error('Header not provided!');
      }
      if (customHeader === process.env.accessToken) {
        const collegedetail = await college.findById(collegeId);
        if (!collegedetail) {
          return res.status(404).json({ message: 'college not found' });
        }

        await college.findByIdAndDelete(collegeId);

        return res.status(200).json({ message: 'college deleted successfully' });
      } else {
        throw new Error('Invalid header value!');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
```

**Algorithm:**

1. Extracts the `collegeId` from the request parameters.
2. Retrieves the `access-token` from the request headers. Returns a 500 error if missing.
3. Verifies the `access-token`. Returns a 500 error if invalid.
4. Retrieves the college document using `college.findById(collegeId)`. Returns a 404 error if not found.
5. Deletes the college document using `college.findByIdAndDelete(collegeId)`.
6. Returns a 200 status code with a success message.
7. Catches any errors and returns a 500 status code with a server error message.

