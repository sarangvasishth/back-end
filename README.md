# Back End Engineering Test
At Boardingware, most of our back end services are written in Typescript/Javascript/Node. This project shares similarities with our main web application in terms of technologies used and application structure. So hopefully this will give you some idea of what its like to be working on the team at Boardingware as you are working on this project.

## Technology
This project is mainly written in Typescript with Node. If you are not  familar with Typescript, you can check out this quick start guide [here](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).

We use TypeORM for our ORM. You can check out TypeORM [here](https://typeorm.io/#/).

## The Database

We dont use SQLite for our database at Boardingware but have done so in this test to keep our back end app lightweight. You can use the command line shell as documented here: https://www.sqlite.org/cli.html to work with the database. 

These are the tables that we have generated:

```sql
CREATE TABLE roll(
   	id INT PRIMARY KEY NOT NULL,
   	name VARCHAR(255) NOT NULL,
	completed_at DATE NOT NULL
);

CREATE TABLE student(
    id INT PRIMARY KEY NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255) NOT NULL
);

CREATE TABLE student_roll_state(
   	id INT PRIMARY KEY NOT NULL,
	student_id INT NOT NULL,
	roll_id INT NOT NULL,
	state CHAR(10) NOT NULL
);

CREATE TABLE group(
   	id INT PRIMARY KEY NOT NULL,
   	name VARCHAR(255) NOT NULL,
	number_of_weeks INTEGER NOT NULL,
	roll_states VARCHAR(255) NOT NULL,
	incidents INTEGER NOT NULL,
	ltmt CHAR NOT NULL,
	run_at DATE,
	student_count INTEGER NOT NULL
);

CREATE TABLE student_group(
   	id INT PRIMARY KEY NOT NULL,
	group_id INT NOT NULL,
	student_id INT NOT NULL,
	incident_count INT NOT NULL
);
```

To browse the database with a command line interface:

```sh
cd back-end && sqlite3 backend-test.db
```

## How to get started and run the back end app
You will need to have Node **10.16.0** or later on your local development machine. You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

### First install all dependencies

```sh
cd back-end && npm i
```

### To start the back-end app

```sh
cd back-end && npm start
```

### Open app in browser

Once the app is compiled successfully you can open the browser and go to http://localhost:4001/student/get-all to see a list of students


## Project structure
Open the project in VSCode as a workspace and install the recommented plugins:

- `vscode-eslint` for linting
- `prettier-vscode` for formatting

You should see the project is structured as follows:

```
.
└── back-end
    └── src
        ├── controller
        ├── entity
        └── interface

```

### src/controller

This is the place for the controllers which contain the actual API functions used by the routes. The client app will call these API functions via the routes setup in `routes.ts`. We have three controllers:

1. GroupController - the apis for Group CRUD as well as running the Group Filters to populate the Groups with Students.
2. RollController - the apis for Roll CRUD as well as for running Student Rolls and storing the resulting Student Roll states.
3. StudentController - the apis for Student CRUD

### src/entity

This is where we have our TypeORM entities. We have one entity per database table. We are using `sqlite3` for our database. In the root folder you will see the `backend-test.db` file which is the sqlite3 database we use. That is configured in `ormconfig.json`. 

### src/interface

This is where we code up our DTOs that we need.

## Postman

You can use the tool Postman to run the APIs against the routes. Postman can be downloaded [here](https://www.postman.com/downloads/).

Note, you will see in `index.ts` that 15 students have been added automatically to the database.

You wil be able to use Postman to do the following:

1. Get all students: GET http://localhost:4001/student/get-all
2. Create a roll: POST http://localhost:4001/roll/create
3. Add student roll states to the roll: POST http://localhost:4001/roll/add-student-states
4. (Not yet implemented) Create a group: POST http://localhost:4001/group/create
5. (Not yet implemented) Run the group filters: POST http://localhost:4001/group/run-group-filters
6. (Not yet implemented) Get the group list: GET http://localhost:4001/group/get-all
7. (Not yet implemented) Get students in a group: GET http://localhost:4001/group/get-students-in-group


## Tasks Background

A Roll is created when Staff at the School do a Roll Check to ensure the Students are all present for the Class or other Activity.

Staff at the School would like to analyse these rolls. They would like to be able to create Filters that populate Groups with Students based on their roll attendance. They will be able to Add as many Groups as they want. Then at any time they would like to carry out an analysis they can Run these Group Filters to populate the Groups with Students.

## The Tasks

There are two Tasks. Task 2 is more complex than Task 1. We would like you to attempt to complete both tasks. You should use Postman to test your APIs as you complete them.

### Task 1 - Develop the Group CRUD lifecycle API's

We need to be able to create groups, update groups, delete groups and get a list of the groups. We also need to be able to get a list of Students in a Group.

#### CreateGroup API

Looking at the Group table, create an API so that a Group can be created with all of the fields populated. It is important that the client provides values for these fields:

* `name` the name of the group
* `number_of_weeks` will just be an integer, representing the number of weeks for the analysis period
* `roll_states` will be one or more of the following values: `"unmark" | "present" | "absent" | "late"`
* `incidents` is an integer representing the number of times the student meets the criteria in the period
* `ltmt` stands for "Less Than or More Than". It will be either a `"<"` string or `">"`.

#### UpdateGroup and DeleteGroup API   	

These APIs will allow the client to update a group and delete a group. The update group API allows the user to update the same fields as the CreateGroup API.

#### GetGroups and GetGroupStudents APIs

The GetGroups API will return a list of groups and will contain all the group fields.
The GetGroupStudents API will return a list of the Students in the Group. It will return an array of students and include the fields: id, first_name, last_name and full_name (which is derived from the first and last name).

### Task 2 - Develop the RunGroupFilters API 

In order to complete this task, you will need to use Postman to generate some roll data into the database to be used for analysis.

When users Run these Group Filters to do an Analysis the following will happen:

1. The Students currently in each Group will be deleted
2. The Filter will be run against each Group and the Group populated with Students that match the filter based on their roll data. It will also store the number of incidents for the Student in the `incident_count` field.
3. The date the filter was `run_at` against each group will be recorded against the Group
4. The number of students in the group, `student_count`, will be stored against the Group

The Group Filters we need to support are:

1. Time Period in Weeks (`number_of_weeks`), AND
2. One or more Roll States: `"unmark" | "present" | "absent" | "late"` (`roll_states`), AND
3. (Greater than the Number of Incidents in the Time Period, OR 
4. Less then the Number of Incidents in the Time Period) (`ltmt` and `incidents`)
# back-end
