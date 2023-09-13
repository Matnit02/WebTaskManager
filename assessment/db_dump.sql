PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE user (
	id INTEGER NOT NULL, 
	username VARCHAR(20) NOT NULL, 
	email VARCHAR(120) NOT NULL, 
	password VARCHAR(80) NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (username), 
	UNIQUE (email)
);
INSERT INTO user VALUES(1,'Admin','admin@admin.admin','$2b$12$NWK8wQzbW5tOUGT4OWaEmOWF/KOZIggi.2lKu3TabX4nLvJPy1WB.','2023-09-12 18:53:59');
INSERT INTO user VALUES(2,'Test','test@test.test','$2b$12$PKFheTRx0JD5o32MqKIrfe1z2e5yvoBTmPpZTJBnpGreVt3mAxeJS','2023-09-12 18:54:43');
INSERT INTO user VALUES(3,'Adam','adam@adam.adam','$2b$12$ecd9pKhwLLUSunnoCAIz7.AoZaLN.k/0PeAetG2uAApu4HBtmaysy','2023-09-12 20:55:54');
INSERT INTO user VALUES(4,'Kamil','kamil@kamil.kamil','$2b$12$x8uub.W/FQZyOsVk3AYO4OTiJRT2aKvbF1PG6pHV2d/7KMvfahB4e','2023-09-12 20:56:47');
CREATE TABLE project (
	id INTEGER NOT NULL, 
	id_owner INTEGER NOT NULL, 
	project_name VARCHAR(255) NOT NULL, 
	description TEXT, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO project VALUES(1,1,'Project 1','Some basic test project','2023-09-12 18:54:15');
INSERT INTO project VALUES(2,2,'Some other project','','2023-09-12 19:17:34');
INSERT INTO project VALUES(3,1,'Empty project','Just an empty project for test purposes','2023-09-13 03:02:05');
INSERT INTO project VALUES(4,1,'Presentation','Quick project to present functionality','2023-09-13 04:13:18');
CREATE TABLE project_users (
	project_id INTEGER, 
	user_id INTEGER, 
	FOREIGN KEY(project_id) REFERENCES project (id), 
	FOREIGN KEY(user_id) REFERENCES user (id)
);
INSERT INTO project_users VALUES(1,1);
INSERT INTO project_users VALUES(2,2);
INSERT INTO project_users VALUES(2,2);
INSERT INTO project_users VALUES(1,2);
INSERT INTO project_users VALUES(3,1);
INSERT INTO project_users VALUES(4,1);
INSERT INTO project_users VALUES(4,2);
CREATE TABLE task (
	id INTEGER NOT NULL, 
	id_owner INTEGER NOT NULL, 
	id_panel VARCHAR(255), 
	task_title VARCHAR(255) NOT NULL, 
	description TEXT, 
	created_at DATETIME NOT NULL, 
	project_id INTEGER NOT NULL, 
	deadline DATETIME, 
	position INTEGER NOT NULL, 
	finished BOOLEAN, 
	parent_id INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES project (id), 
	FOREIGN KEY(parent_id) REFERENCES task (id)
);
INSERT INTO task VALUES(6,1,'completed','Task with many subtasks','Task with many subtasks Task with many subtasks Task with many subtasks Task with many subtasks','2023-09-12 18:58:52',1,'2024-01-25 20:57:00.000000',0,1,NULL);
INSERT INTO task VALUES(7,1,NULL,'Subtask 1','Subtask 1Subtask 1Subtask 1','2023-09-12 18:58:52',1,'2023-09-20 20:57:00.000000',0,1,6);
INSERT INTO task VALUES(9,1,NULL,'Subtask 3','Subtask 3 Subtask 3 Subtask 3 Subtask 3','2023-09-12 18:58:52',1,'2023-09-12 20:58:00.000000',1,1,6);
INSERT INTO task VALUES(10,1,'not-started','Test 1','Test 1','2023-09-12 19:01:53',1,'2023-10-06 21:01:00.000000',0,0,NULL);
INSERT INTO task VALUES(11,1,NULL,'Test 1','Test 1','2023-09-12 19:01:53',1,'2023-09-28 21:01:00.000000',0,0,10);
INSERT INTO task VALUES(12,1,NULL,'Test 1Test 1','Test 1Test 1','2023-09-12 19:01:53',1,'2023-10-02 21:01:00.000000',1,0,10);
INSERT INTO task VALUES(13,1,'re-opened','Test 1','Test 1','2023-09-12 19:05:11',1,'2023-10-06 21:01:00.000000',0,0,NULL);
INSERT INTO task VALUES(15,1,NULL,'Test 1Test 1','Test 1Test 1','2023-09-12 19:05:11',1,'2023-10-02 21:01:00.000000',2,1,13);
INSERT INTO task VALUES(24,1,'completed','Some new test','Some new test','2023-09-12 19:29:28',1,'2023-10-26 21:29:00.000000',2,1,NULL);
INSERT INTO task VALUES(26,1,NULL,'test 12','test 1test 1','2023-09-12 19:29:28',1,'2023-09-09 21:29:00.000000',2,1,24);
INSERT INTO task VALUES(27,1,NULL,'test 1test 1','','2023-09-12 19:29:28',1,'2023-09-06 21:29:00.000000',3,1,24);
INSERT INTO task VALUES(33,1,'completed','Now it works for sure','Now it works for sure','2023-09-12 19:43:35',1,'2023-12-21 21:43:00.000000',1,1,NULL);
INSERT INTO task VALUES(34,1,'in-review','NEW TEST','','2023-09-12 20:15:28',1,'2023-09-29 22:15:00.000000',0,0,NULL);
INSERT INTO task VALUES(35,1,NULL,'HAHA','aaaaaa','2023-09-12 20:15:28',1,'2023-08-31 22:15:00.000000',1,1,34);
INSERT INTO task VALUES(36,1,'in-progress','Dynamic test','Dynamic testDynamic testDynamic test','2023-09-12 20:27:39',1,'2023-10-08 22:27:00.000000',0,0,NULL);
INSERT INTO task VALUES(37,1,NULL,'Dynamic test 1','Dynamic testDynamic testDynamic test','2023-09-12 20:27:39',1,'2023-09-06 22:27:00.000000',2,1,36);
INSERT INTO task VALUES(38,1,NULL,'Dynamic test 2','Dynamic testDynamic testDynamic test','2023-09-12 20:27:39',1,'2023-09-11 22:27:00.000000',1,1,36);
INSERT INTO task VALUES(39,1,NULL,'Dynamic test 3','Dynamic testDynamic testDynamic test','2023-09-12 20:27:39',1,'2023-09-01 22:27:00.000000',0,1,36);
INSERT INTO task VALUES(40,1,'re-opened','Dynamic event test again','Dynamic event test again','2023-09-12 20:54:57',1,'2023-09-22 22:54:00.000000',1,0,NULL);
INSERT INTO task VALUES(41,1,NULL,'Subtask 1','Some subtaskSome subtaskSome subtask','2023-09-12 20:54:57',1,'2023-09-02 22:54:00.000000',1,1,40);
INSERT INTO task VALUES(42,1,NULL,'Subtask 2','Some subtaskSome subtaskSome subtaskSome subtask','2023-09-12 20:54:57',1,'2023-09-01 22:54:00.000000',2,0,40);
INSERT INTO task VALUES(43,1,'not-started','Kitchen Clean-Up','Tidy up and sanitize the kitchen area.','2023-09-13 04:16:15',4,'2023-09-30 06:14:00.000000',1,0,NULL);
INSERT INTO task VALUES(44,1,NULL,'Clear the Counters','Remove any items that don''t belong and wipe down the surfaces.','2023-09-13 04:16:15',4,'2023-09-14 06:15:00.000000',1,0,43);
INSERT INTO task VALUES(45,1,NULL,'Wash the Dishes','Ensure that all dishes are cleaned, dried, and put away.','2023-09-13 04:16:15',4,'2023-09-14 06:15:00.000000',2,0,43);
INSERT INTO task VALUES(46,1,'in-progress','Monthly Budgeting','Plan and allocate funds for monthly expenses.','2023-09-13 04:20:01',4,'2023-10-20 06:19:00.000000',0,0,NULL);
INSERT INTO task VALUES(47,1,NULL,'Review Previous Month''s Expenses','Go through bank statements and receipts to understand past spending.','2023-09-13 04:20:01',4,'2023-09-14 06:19:00.000000',1,1,46);
INSERT INTO task VALUES(48,1,NULL,'Allocate Funds for Essential Bills','Set aside money for rent, utilities, and other recurring bills.','2023-09-13 04:20:01',4,'2023-09-18 06:19:00.000000',2,0,46);
INSERT INTO task VALUES(49,1,'in-review','Organize Home Office','Create a clutter-free and productive workspace.','2023-09-13 04:20:23',4,'2023-09-21 06:20:00.000000',0,0,NULL);
INSERT INTO task VALUES(50,1,'re-opened','Bake Chocolate Chip Cookies','Prepare homemade cookies for a family gathering.','2023-09-13 04:21:07',4,'2023-09-27 06:20:00.000000',0,0,NULL);
INSERT INTO task VALUES(51,1,NULL,'Gather Ingredients','Ensure you have flour, sugar, chocolate chips, etc.','2023-09-13 04:21:07',4,'2023-09-12 06:20:00.000000',1,1,50);
INSERT INTO task VALUES(52,1,NULL,'Preheat Oven','Set the oven to the desired temperature as per the recipe.','2023-09-13 04:21:07',4,'2023-09-08 06:21:00.000000',2,0,50);
INSERT INTO task VALUES(53,1,'completed','Update Resume','Refresh CV for job applications.','2023-09-13 04:21:49',4,'2023-09-22 06:21:00.000000',1,1,NULL);
INSERT INTO task VALUES(54,1,NULL,'Review Work Experience','Add any new roles or responsibilities since the last update.','2023-09-13 04:21:49',4,'2023-09-12 06:21:00.000000',1,1,53);
INSERT INTO task VALUES(55,1,NULL,'Check References','Ensure all references are up-to-date and informed.','2023-09-13 04:21:49',4,'2023-09-04 06:21:00.000000',2,1,53);
INSERT INTO task VALUES(56,1,'not-started','Garden Maintenance','Enhance the garden''s health and appearance.','2023-09-13 04:23:33',4,'2023-09-21 06:23:00.000000',0,0,NULL);
INSERT INTO task VALUES(57,1,NULL,'Weed Removal','Remove any unwanted plants from the garden beds.','2023-09-13 04:23:33',4,'2023-09-12 06:23:00.000000',1,0,56);
INSERT INTO task VALUES(58,1,NULL,'Water Plants','Ensure all plants receive adequate water.','2023-09-13 04:23:33',4,'2023-09-09 06:23:00.000000',2,0,56);
INSERT INTO task VALUES(59,1,'in-progress','Write Blog Post','Create content for personal blog.','2023-09-13 04:26:34',4,'2023-09-07 06:26:00.000000',1,0,NULL);
INSERT INTO task VALUES(60,1,NULL,'Research Topic','Gather information on the chosen topic.','2023-09-13 04:26:34',4,'2023-09-01 06:26:00.000000',1,1,59);
INSERT INTO task VALUES(61,1,NULL,'Create a Draft','Begin writing the content, ensuring coherence and accuracy.','2023-09-13 04:26:34',4,'2023-09-02 06:26:00.000000',2,0,59);
INSERT INTO task VALUES(62,1,'completed','Organize Closet','Declutter and arrange wardrobe.','2023-09-13 04:27:16',4,'2023-09-28 06:26:00.000000',2,1,NULL);
INSERT INTO task VALUES(63,1,NULL,'Sort Out Clothes','Decide which items to keep, donate, or discard.','2023-09-13 04:27:16',4,'2023-09-11 06:27:00.000000',1,1,62);
INSERT INTO task VALUES(64,1,NULL,'Rearrange Footwear','Organize shoes by type and frequency of use.','2023-09-13 04:27:16',4,'2023-09-01 06:27:00.000000',2,1,62);
INSERT INTO task VALUES(65,1,'in-progress','Prepare for Meeting','Get ready for an important work meeting.','2023-09-13 04:28:01',4,'2023-10-07 06:27:00.000000',2,0,NULL);
INSERT INTO task VALUES(66,1,NULL,'Review Meeting Agenda','Familiarize yourself with the topics to be discussed.','2023-09-13 04:28:01',4,'2023-09-08 06:27:00.000000',1,1,65);
INSERT INTO task VALUES(67,1,NULL,'Prepare Presentation','Create slides or gather materials to present.','2023-09-13 04:28:01',4,'2023-09-01 06:27:00.000000',2,1,65);
COMMIT;
