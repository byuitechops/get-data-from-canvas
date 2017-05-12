# Program Instructions
- Download or git clone repository to an empty directory on your computer.
- Run generate-data.js
- OUTPUT: 3 CSV files:


1. Student Page Views
2. Student Quiz Statistics
3. Student Quiz Comments and Reviewer turnaround time

# What we need from Canvas

## *Quiz Stats*

### Student Quiz Scores, Number of Attempts, Time Spent, and Time Submitted

##### *Why:* 
To collect data on how well students are doing on a given quiz

##### *Calls Needed:*
- [Get all quiz submissions](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
```

##### *Explanation of Calls:*
Returns an array of submissions, the submission contains the attributes `score`, `attempt`, `time_spent`, and `finished_at` which can be used for Quiz Score, Number of Attempts, Time Spent, and Time Submitted respectively.

##### *Limitations:*
- **BETA** API

##### *CSV Format:*
|  | Student | Score | Number of Attempts | Time Spent | Time Submitted
| - | - | - | - | - | - |
| Quiz | | | | | | |

----

### Performance on each Question item

##### *Why:* 
To see which questions the students struggled with the most

##### *Calls Needed:*
- [Get all quiz submission questions](https://canvas.instructure.com/doc/api/quiz_submission_questions.html#method.quizzes/quiz_submission_questions.index)
```
GET /api/v1/quiz_submissions/:quiz_submission_id/questions
```
- [Fetching the latest quiz statistics](https://canvas.instructure.com/doc/api/quiz_statistics.html#method.quizzes/quiz_statistics.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/statistics
```

##### *Explanation of Calls:*
The first claims to return the answer the student chose, though it does not. So if that eventually works then great.

The second is better for an evaluation of how all the students preformed on a single question,
which answer the majority of them chose and such. But it also lists the names of the students who chose each answer, which could 
theoretically be used to see how a student scored on a single question.

##### *Limitations:*
- Both **BETA** API

- The first is ***not a working match*** It claims to be able to return the student 
answers, but returns something else.

##### *CSV Format:*
|  | Quiz | Question | Percent that chose this |
| - | - | - | - |
| Answer | | | | |

---


### Time spent on each Question item

##### *Why:* 
For teachers to analyze the difficulty distribution among questions

##### *There is nothing to suggest that they record this data*





## *Content Stats*



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

This call will return a list of Page Views. We will be using the `created_at`, `interation_seconds`,
and `url` attributes to determine the Timestamp, time spent and number of view respectively

##### *CSV Format:*
|  | Student | URL | Number of Visits | Timestamp | Time Spent |
| - | - | - | - | - | - |
| Visit | | | | | | |




## *Review Stats*




### Reviewer feedback (text sent to students about their performance)

##### *Why:* 
To get comments that teachers have provided to the students

##### *Calls Needed:*
- [Get a single submission](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id?include[]=submission_comments
```

##### *Explanation of Call:*
This GET request returns a submission which contains `submission_comments`.  This attribute contains the comment, timestamp, and author

##### *Limitations:*
- **BETA** API

##### *CSV Format:*	
|  | Assignment ID | Student | Grader | Comment | Timestamp |
| - | - | - | - | - | - |
| Submissions | | | | | | |

---

### Timestamp on when assessment was opened and completed/returned for review 

##### *Questions for Henrie:*
- Do we want the entire history of when assignments received grades?  Or, do we want only the most recent 
change?

##### *Why:* 
To know how long it took to grade the assignments

##### *Calls Needed:*

- [GradeChangeEvent - by assignment](https://canvas.instructure.com/doc/api/grade_change_log.html#method.grade_change_audit_api.for_assignment)
```
GET /api/v1/audit/grade_change/assignments/:assignment_id
```
- [List assignment submissions (Submission Object)](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.index)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions
```
- [Gradebook history](https://canvas.instructure.com/doc/api/gradebook_history.html#method.gradebook_history_api.feed)
```
GET /api/v1/courses/:course_id/gradebook_history/feed
```

##### *Explanation of Calls:*

Returns a list of grading events, which contains information about grader, timestamp, and grade.

After investigating, the Gradebook History method is the best method if you don't have admin privileges.

**[X]Program Written**

##### *Limitations:*
- Canvas doesn't track when grading has begun and closed, but it does track when things have been graded.
- **BETA** API - Gradebook History
- **Requires Admin Priveliges** - GradeChangeEvent

##### *CSV Format:*

|  | Student_id | Grader_id | Grader_Name | Timestamp Submitted | Timestamp Graded | 
| - | - | - | - |
| Student | | | | | | |



## *Other*




### Number of logins per day for each student

##### *Why:* 
Assuming that it is a simular reason to why they want number of page views per day

##### *Calls Needed:*
- [Query by user](https://canvas.instructure.com/doc/api/authentications_log.html#method.authentication_audit_api.for_user)
```
GET /api/v1/audit/authentication/users/:user_id
```

##### *Explanation of Call:*
Under the events property is a list of all the times the user has logged in. Which includeds a timestamp, 
so the number of logins per day can be deduced.

The property named "created_at" is what we're looking for.  This will give us the timestamp.

**[X]Program Written**

##### *CSV Format:*

|  | Number of Logins | 
| - | - |
| Day | |