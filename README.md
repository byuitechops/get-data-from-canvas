# What we need from Canvas

## *Quiz Stats*

### Student Quiz Scores, Number of Attempts, and Time Spent

*Why:* To collect data on how well students are doing on a given quiz

##### *Calls Needed:*

- [Get all quiz submissions](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
```

##### *Explanation of Calls:*

Returns an array of submissions, the submission contains the attributes *score*, *attempt*,and *time_spent* 
which can be used for Quiz Score, Number of Attempts, and Time Spent respectively

*CSV Format:*

|  | Score | Number of Attempts | Time Spent |
| - | - | - | - |
| Quiz | | | | |


### Limitations
- BETA API

## Performance on each Question item

*Why:* Assuming they would like to see the student answers and scores for each question

*Calls Needed:*

- [Get all quiz submission questions](https://canvas.instructure.com/doc/api/quiz_submission_questions.html#method.quizzes/quiz_submission_questions.index)
```
GET /api/v1/quiz_submissions/:quiz_submission_id/questions
```

*Explanation of Calls:*

### Limitations
- BETA API

- ***Not a full match*** It claims to be able to return the student 
answers, but returns something else, It is still in beta so wait until it works I guess

----- 

OR 

-----

- [Fetching the latest quiz statistics](https://canvas.instructure.com/doc/api/quiz_statistics.html#method.quizzes/quiz_statistics.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/statistics
```

*Explanation of Call:*

Better for an overall evaluation of how students preformed on questions, which answer the majority of them used and such.
But it also lists the names of the students who chose each answer, which could theoretically be used to see students scores,
on each question.

## Time spent on each Question item

*Why:* For teachers to analyise the difficulty distribution among questions

*Result:* There is nothing to suggest that they are recording this data

## *Content Stats*

## TimeStamp, Time Spent, and Number of page views by a student on each LMS page

*Why:* To see how often a student accessed a certain page in Canvas.

*Calls Needed:*

- [List user page views](https://canvas.instructure.com/doc/api/users.html#method.page_views.index)
```
GET /api/v1/users/:user_id/page_views
```

- Additional Parameters:
-  start_time
-  end_time

*Explanation of Calls:*

This call will return a list of PageView objects. We will be using the *created_at*, *interation_seconds*,and *url* attributes to determine the Timestamp, timespent and number of view respectivley

*CSV Format:*

- Following the link provided, it says that a CSV file should be downloadable. Otherwise there is this.

|  | Student | URL | Number of Visits | Timestamp | Time Spent |
| - | - | - | - | - | - |
| Visit | | | | | | |

## *Review Stats*

## Reviewer feedback (text sent to students about their performance)

*Why:* To get comments that a teachers has provided 

*Calls Needed:*
- [Get a single submission](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id?include[]=submission_comments
```

*Explanation of Calls:*
This GET request returns a submission Object.  In this Submission Object is found a property named `submission_comments`.  This property contains the comment, timestamp, and author

*CSV Format:*

Rows: Each row is a student that has completed a quiz
GET:
Columns:
- Col 1:
    - The user_id 
- Col 2:
    - The comments that were retrieved for that user_id
	
|  | Assignment ID | Student | Grader | Comment | Timestamp |
| - | - | - | - | - | - |
| Submissions | | | | | | |
    
### Limitations
- BETA API - PUT request
    
## Time stamp on when assessment was completed (ready for review)

##### Questions for Henrie
- By assessment, do you mean quiz?
- Is this for all quizzes, or by each individual student?

*Why:* To know when each quiz was completed, so that reviewers can get the go ahead on when to review.  Also, so that teachers may know when a student submitted a quiz.

*Calls Needed:*

- [FOR ALL QUIZ SUBMISSIONS FOR THIS QUIZ](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
``` 
- [FOR THE SINGLE QUIZ SUBMSSION FOR A STUDENT ON THIS QUIZ](https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.submission)
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submission
```

*Explanation of Calls:*

These calls return in the case of the first a list of Quiz Submission objects, or in the case of the second, an individual Quiz Submission Object.  In this object is found the property "finished_at" that returns the value of when the quiz was finished and submitted in the following format: "2013-11-07T13:16:18Z".

*CSV Format:*

Rows: Each row is a student that has submitted a quiz

Columns:
- Col 1: 
    - The user_id of the student.
- Col 2:
    - The finished_at timestamp.
    
### Limitations
- BETA API - both

## Time stamp on when assessment was opened and completed/returned for review 

##### Questions for Henrie
- Do we want the entire history of when assignments received grades?  Or, do we want only the most recent changes, such as a GradeChangeEvents Object?

*Why:* The reason why we would need this is to know when a reviewer started to review an assignment.  This would help in knowing the productivity of reviewers and lenghyness of assignments.

*Calls Needed:*

- [GradeChangeEvent - by assignment](https://canvas.instructure.com/doc/api/grade_change_log.html#method.grade_change_audit_api.for_assignment)
```
GET /api/v1/audit/grade_change/assignments/:assignment_id
```
- [URL for Gradebook history](https://canvas.instructure.com/doc/api/gradebook_history.html)
```
GET /api/v1/courses/:course_id/gradebook_history/feed
```

*Explanation of Calls:*

I haven't found an api yet that states that an assignment can have an "open" and "closed" time for review.  Instead, I've found that there are gradeChangeEvents Objects that have a time stamp on them for an event on which you changed a grade.

*CSV Format:*

Rows: The names of the graders that we are looking at.

Columns:
- Col 1: 
    - grader_id.
- Col 2:
    - The value for "graded_at" property.
    
### Limitations
- BETA API - Gradebook History

    
## Who reviewed an assessment submission

*Why:* So that we know who reviewed a student's work.

*Calls Needed:*

- [Get a single submission](https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show)
```
GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
```

*Explanation of Calls:*

This GET request returns a submission Object.  In the submission is a property named "grader_id" that has the user id of the grader who reviewed and assigned a grade to a submission.  

*CSV Format:*

Rows: Submission_Id

Columns:
- Col 1: 
    - grader_id.
- Col 2:
    - The Grader's Name.


## *Other*

## Number of logins per day for each student

*Why:* Assuming that it is a simular reason to why they want number of page views per day

*Calls Needed:*

- [Query by user](https://canvas.instructure.com/doc/api/authentications_log.html#method.authentication_audit_api.for_user)
```
GET /api/v1/audit/authentication/users/:user_id
```

*Explanation of Calls:*

Under the events property is a list of all the times the user has logged in. Which includeds a time stamp, so the number of logins per day can be deduced.

The property named "created_at" is what we're looking for.  This will give us the time stamp.

*CSV Format:*

Rows: Student Names

Columns:
- Col 1:
    - user_id of each student.
- Col 2:
    - Timestamp of when login occured.