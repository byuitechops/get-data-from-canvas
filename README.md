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
| - | - | - | - | - |
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

The second is better for an evaluation of how all the students preformed on a single question, which answer the majority of them chose and such. But it also lists the names of the students who chose each answer, which could 
theoretically be used to see how a student scored on a single question.

##### *Limitations:*
- Both **BETA** API

- The first is ***not a working match*** It claims to be able to return the student 
answers, but returns something else.

##### *CSV Format:*
|  | Quiz | Question | Percent that chose this |
| - | - | - |
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

This call will return a list of Page Views. We will be using the `created_at`, `interation_seconds`,
and `url` attributes to determine the Timestamp, time spent and number of view respectivley

##### *CSV Format:*
|  | Student | URL | Number of Visits | Timestamp | Time Spent |
| - | - | - | - | - | - |
| Visit | | | | | | |




## *Review Stats*




### Reviewer feedback (text sent to students about their performance)

##### *Why:* 
To get comments that a teachers has provided 

##### *Calls Needed:*
- [Get a single submission](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id?include[]=submission_comments
```

##### *Explanation of Call:*
This GET request returns a submission which contains `submission_comments`.  This attribute contains the comment, timestamp, and author

##### *Limitations:*
- **BETA** API - PUT request

##### *CSV Format:*	
|  | Assignment ID | Student | Grader | Comment | Timestamp |
| - | - | - | - | - | - |
| Submissions | | | | | | |

---

### Time stamp on when assessment was completed (ready for review)

##### Questions for Henrie
- By assessment, do you mean quiz?
- Is this for all quizzes, or by each individual student?

*Why:* To know when each quiz was completed, so that reviewers can get the go ahead on when to review.  Also, so that teachers may know when a student submitted a quiz.

*Calls Needed:*

- [For all quiz submissions for a cetain quiz](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
``` 
- [For a single quiz submission of a user](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.submission)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submission
```

---

### Timestamp on when assessment was opened and completed/returned for review 

##### *Questions for Henrie:*
- Do we want the entire history of when assignments received grades?  Or, do we want only the most recent 
changes, such as a GradeChangeEvents Object?

##### *Why:* 
The reason why we would need this is to know when a reviewer started to review an assignment.  
This would help in knowing the productivity of reviewers and lenghyness of assignments.

##### *Calls Needed:*

- [GradeChangeEvent - by assignment](https://canvas.instructure.com/doc/api/grade_change_log.html#method.grade_change_audit_api.for_assignment)
```
GET /api/v1/audit/grade_change/assignments/:assignment_id
```
- [URL for Gradebook history](https://canvas.instructure.com/doc/api/gradebook_history.html)
```
GET /api/v1/courses/:course_id/gradebook_history/:date/graders/:grader_id/assignments/:assignment_id/submissions
```

##### *Explanation of Calls:*
Canvas dosen't track when grading has began and closed, but it does track when things have been graded.

**GradeChangeEvents:**
This object will contain a "created_at" property that is a timestamp of when the Grade was changed.  Within the
"links" property, there is another object that has the "grader" property, which is the grader's user_id.

**GradebookHistory:**
This API call will return a list of SubmissionHistory Objects.  Each SubmissionHistory Object contains an array of
SubmissionVersion Objects, which are the various graded versions of the Assignment.  In this object is found the 
"grader" property, which is "the name of the user who graded this version of the submission," as well as 
"graded_at" property, which is the "timestamp for the grading of this version of the submission."(API 
documentation).

##### *Limitations:*
- **BETA** API - Gradebook History

##### *CSV Format:*
#####GradeChangeEvent Method

|  | Timestamp | Grade | 
| - | - | - |
| Assignment | | | |

#####Gradebook History Method

|  | Grader | Timestamp | Grade | 
| - | - | - |
| Submissions | | | | |

    

---
    
### Who reviewed an assessment submission

##### *Why:* 
So that we know who reviewed a student's work.

##### *Calls Needed:*

**This will yield the grader's user_id and is more stable than Gradebook History:**
- [List assignment submissions (Submission Object)](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.index)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions
```

**This will yield the grader's name and user_id, but is in BETA:**
- [Lists Submissions (Gradebook History)](https://canvas.instructure.com/doc/api/gradebook_history.html#method.gradebook_history_api.submissions)
```
GET /api/v1/courses/:course_id/gradebook_history/:date/graders/:grader_id/assignments/:assignment_id/submissions
```

##### *Explanation of Call:*

**Submission Object:**  This GET request returns a list of Submission Objects for a certain assignment_id.  In the 
submission is a property named "grader_id" that has the user id of the grader who reviewed and assigned a grade to 
a submission.  

**Gradebook History:**  (Same as Gradebook History above) This API call will return a list of SubmissionHistory 
Objects.  Each SubmissionHistory Object contains an array of SubmissionVersion Objects, which are the various 
graded versions of the Assignment.  In this object is found the "grader" property, which is "the name of the user 
who graded this version of the submission,"

##### *CSV Format:*
|  | Grader | Assigment | Grade | Timestamp |
| - | - | - | - |
| Changes | | | | | |

##### Limitations
- BETA API - Gradebook History



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

##### *CSV Format:*

|  | Number of Logins | 
| - | - |
| Day | |