# Program Instructions
1. Download or git clone repository to an empty directory on your computer.
2. Run generate-data.js
3. OUTPUT: 3 CSV files:


- Student Page Views (According to start and end time range)
- Student Quiz Statistics
- Student Quiz Comments and Reviewer turnaround time

### Information needed to run program:
- Course ID
- An Access Token for the course you are looking up (preferably Admin)
- What domain you are accessing (Example: byui, byuh)
- If desired, a start and end time from which to get page view data

# What we need from Canvas

## *Quiz Statistics*

### Student Quiz Scores, Number of Attempts, Time Spent, Time Submitted and Statistics for each Question

##### *Why:* 
To collect data on how well students are doing on a given quiz

##### *Calls Needed:*
- [Get all quiz submissions](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
```

##### *Explanation of Calls:*
Returns an array of submissions.  Each submission contains the attributes `score`, `attempt`, `time_spent`, and `finished_at`.  

##### *Limitations:*
- **BETA** API

##### *CSV Format:*
|  | Student Name | Student ID | Quiz ID | Number of Attempts | Score | Time Started | Time Finished | Time Spent(in seconds) | Statistics for each Question
| - | - | - | - | - | - | - | - | - | - |
| Quiz Submission | | | | | | | | | | |

----


## *Page Views*


### Number of page views, Timestamp, and Time Spent by a student on each LMS page

##### *Why:* 
To see how often a student accessed a certain page in Canvas.

##### *Calls Needed:*

- [List user page views](https://canvas.instructure.com/doc/api/users.html#method.page_views.index)
```
GET /api/v1/users/:user_id/page_views
```

##### *Explanation of Call:*

*Requires Admin Priveliges*

This call will return a list of Page Views. Because this API's `interaction_seconds` property does not work as well as we need it to, we will use the `created_at` attributes of the current and most recent page views to manually calculate the time spent by students on a certain page.

Currently, this API call will only work if it is supplied an Admin Access Token for the specific course you are trying to ask.  For instance, if I have an Admin Access Token for my own course, but I am trying to get page views for another course and do not have sufficient priveliges with my Access Token, it will not work and the page views part of the program will end with errors.

##### *CSV Format:*
|  | Student ID | URL | Time Accessed | Time Spent |
| - | - | - | - | - |
| Visit | | | | | |

---


## *Review Statistics and Comments*


### Reviewer feedback (text sent to students about their performance), and turnaround time for grading

##### *Why:* 
To get comments that teachers have provided to the students.  Also, to assess how long it took reviewers to grade each submission.

##### *Calls Needed:*
- [Get a single submission](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id?include[]=submission_comments
```

##### *Explanation of Call:*
This GET request returns a submission which contains `submission_comments`.  This attribute contains the comment, timestamp, and author for each submission.  Our program works so that it returns a list of comments for each submission, seperated by semi-colons (;).

This API also returns a list of grading events, which contains information about the grader, when it was graded, and the actual grade.

##### *Limitations:*
- **BETA** API
- Canvas doesn't track when grading has begun and closed, but it does track when things have been graded.

##### *CSV Format:*	
|  | Student ID | Student Name | Assignment ID | Grader ID | Time Submitted | Time Graded | Comments | Time Commented | Commenter
| - | - | - | - | - | - | - | - | - | - |
| Assignment Submission | | | | | | | | | | |