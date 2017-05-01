# Get Data From Canvas

This repo is how we will get the data we need for analysis. 

# Needs

## *Quiz Stats*

## Studnet Quiz Scores 

*Why:* Assuming to see the results of all the students who have take the quiz

*Calls Needed:*

- https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
```
*Explanation of Calls:*

Returns an array of submissions, the submission contains a score property

## Number of Attempts By Student

*Why:* Need to see how many time the student has attempted the quiz

*Calls Needed:*

- https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
```
*Explanation of Calls:*

Returns an array of submissions, the submission contains 
a attempt property which is the number of attempts

## Time spent on each Quiz

*Why:* If they would like to know how long the student spent on the test

*Calls Needed:*

- https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index
```
GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
```
*Explanation of Calls:*

Returns an array of submissions, the submission contains a 
time_spent property which is the number of seconds the student spent

## Performance on each Question item

*Why:* Assuming they would like to see the student answers and scores for each question

*Calls Needed:*

- https://canvas.instructure.com/doc/api/quiz_submission_questions.html#method.quizzes/quiz_submission_questions.index
```
GET /api/v1/quiz_submissions/:quiz_submission_id/questions
```

*Explanation of Calls:*

***Not a full match*** It claims to be able to return the student 
answers, but returns something else, so wait until it works i guess

## Time spent on each Question item

*Why:* For teachers to analyise the difficulty distribution among questions

*Result:* There is nothing to suggest that they are recording this data



## *Content Stats*

## Number of page views by a student on each LMS page

##### Questions for Henrie
- Q1
- Q2

*Why:* To see how many times a student accessed a certain page in Canvas.

*Calls Needed:*

- GET /api/v1/users/:user_id/page_views
- https://canvas.instructure.com/doc/api/users.html#method.page_views.index
- Parameters:
-  start_time
-  end_time

*Explanation of Calls:*

Perform an https GET request to the given URL.  ":user_id" can be replaced with "self" for the id of the user accessing the id.
This call will return a list of PageView objects.  In the object is found the URL of the page that the student viewed.
A PageView Object looks like the following:
// The record of a user page view access in Canvas
{
  // A UUID representing the page view.  This is also the unique request id
  "id": "3e246700-e305-0130-51de-02e33aa501ef",
  // If the request is from an API request, the app that generated the access token
  "app_name": "Canvas for iOS",
  // The URL requested
  "url": "https://canvas.instructure.com/conversations",
  // The type of context for the request
  "context_type": "Course",
  // The type of asset in the context for the request, if any
  "asset_type": "Discussion",
  // The rails controller that handled the request
  "controller": "discussions",
  // The rails action that handled the request
  "action": "index",
  // This field is deprecated, and will always be false
  "contributed": false,
  // An approximation of how long the user spent on the page, in seconds
  "interaction_seconds": 7.21,
  // When the request was made
  "created_at": "2013-10-01T19:49:47Z",
  // A flag indicating whether the request was user-initiated, or automatic (such as
  // an AJAX call)
  "user_request": true,
  // How long the response took to render, in seconds
  "render_time": 0.369,
  // The user-agent of the browser or program that made the request
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/536.30.1 (KHTML, like Gecko) Version/6.0.5 Safari/536.30.1",
  // True if the request counted as participating, such as submitting homework
  "participated": false,
  // The HTTP method such as GET or POST
  "http_method": "GET",
  // The origin IP address of the request
  "remote_ip": "173.194.46.71",
  // The page view links to define the relationships
  "links": {"user":1234,"account":1234}
}



*CSV Format:*

Following the link provided, it says that a CSV file should be downloadable.

Rows: Each row is a student that was searched for.

Columns:
- Col 1:
    - URL visited
- Col 2:
    - Number of instances
    
## Time stamp of each page view by a student
(SAME AS ABOVE)

##### Questions for Henrie
- Q1
- Q2

*Why:* To know when exactly a student accessed a certain page on a course, in the hopes that student activity would be accurately redered.

*Calls Needed:*

- (SAME AS ABOVE)
- GET /api/v1/users/:user_id/page_views
- https://canvas.instructure.com/doc/api/users.html#method.page_views.index
- Parameters:
-  start_time
-  end_time

*Explanation of Calls:*

In a PageView Object, there is an property named "created_at" that contains the date-time-stamp of when the GET request the student initiated was made.

*CSV Format:*
(same as above)

Rows: Each row is a student that we are querying

Columns:
- Col 1:
    - URL the user viewed
- Col 2:
    - Timestamp of when the user viewed that URL

## Time spent by a student on a page
(SAME AS ABOVE)

##### Questions for Henrie
- Q1
- Q2

*Why:* To know how long a student spent on a certain page.  For instance, if we wanted to know how long it took a student to read an article or take a quiz, having this information would benefit the teacher.

*Calls Needed:*

- (SAME AS ABOVE)
- GET /api/v1/users/:user_id/page_views
- https://canvas.instructure.com/doc/api/users.html#method.page_views.index
- Parameters:
-  start_time
-  end_time

*Explanation of Calls:*

In a PageView Object, there is a property named "interaction_seconds" that contains the approximation of the number of seconds the user was on the page. 

*CSV Format:*

Rows: Each row is a student that we are querying

Columns:
- Col 1:
    - URL a student viewed
- Col 2:
    - Total time spent on that URL










## *Review Stats*

## Reviewer feedback (text sent to students about their performance)

##### Questions for Henrie
- Q1
- Q2

*Why:* To provide students with specific feedback on how they can improve.

*Calls Needed:*

- PUT /api/v1/courses/:course_id/quizzes/:quiz_id/submissions/:id
- https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.update

*Explanation of Calls:*

Within the 'questions' property of the PUT request object, there is a space for each question of the quiz
you want to put a comment on/change grade of.  Here, you can change the comments and the grade for each question.  As stated in the URL: Type Hash.  The keys are the specific question IDs in the quiz, and the values are hashes of 'score' and 'comment' entries.

*CSV Format:*

Rows: Each row is a student that has completed a quiz

Columns:
- Col 1:
    - The Question ID to comment upon.
- Col 2:
    - The comment the reviewer desires to apply to the question.
- Col 3:
    - (IF DESIRED) The new grade the reviewer desires to apply to the question.
    
    
## Time stamp on when assessment was completed (ready for review)

##### Questions for Henrie
- By assessment, do you mean quiz?
- Is this for all quizzes, or by each individual student?

*Why:* To know when each quiz was completed, so that reviewers can get the go ahead on when to review.  Also, so that teachers may know when a student submitted a quiz.

*Calls Needed:*

- (FOR ALL QUIZ SUBMISSIONS FOR THIS QUIZ) GET /api/v1/courses/:course_id/quizzes/:quiz_id/submissions
- https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.index
- (FOR THE QUIZ SUBMSSION FOR A STUDENT ON THIS QUIZ) GET /api/v1/courses/:course_id/quizzes/:quiz_id/submission
- https://canvas.instructure.com/doc/api/quiz_submissions.html#method.quizzes/quiz_submissions_api.submission

*Explanation of Calls:*

These calls return in the case of the first a list of Quiz Submission objects, or in the case of the second, an individual Quiz Submission Object.  In this object is found the property "finished_at" that returns the value of when the quiz was finished and submitted in the following format: "2013-11-07T13:16:18Z".

*CSV Format:*

Rows: Each row is a student that has submitted a quiz

Columns:
- Col 1: 
    - The user_id of the student.
- Col 2:
    - The finished_at timestamp.
    
    
## Time stamp on when assessment was opened for review 

I haven't found an api yet that states that an assignment can have an "open" and "closed" time for review.  Instead, I've found that there are gradeChangeEvents Objects that have a time stamp on them for an event on which you changed a grade.

##### Questions for Henrie
- Do we want the entire history of when assignments received grades?  Or, do we want only the most recent changes, such as a GradeChangeEvents Object?
- Q2

*Why:* this is why we need this

*Calls Needed:*

- (GradeChangeEvent - by assignment) GET /api/v1/audit/grade_change/assignments/:assignment_id
- https://canvas.instructure.com/doc/api/grade_change_log.html#method.grade_change_audit_api.for_assignment
- (URL for Gradebook history) https://canvas.instructure.com/doc/api/gradebook_history.html

*Explanation of Calls:*

if needed

*CSV Format:*

Rows: Each row is a student that ...

Columns:
- Col 1:
    - Col 1 comes from call 2 and does ...
- Col 2:
    - Col 2 comes from call 1 and does ...

## Time stamp on when review was completed/returned to student

##### Questions for Henrie
- Q1
- Q2

*Why:* this is why we need this

*Calls Needed:*

- Call 1
- Call 2

*Explanation of Calls:*

if needed

*CSV Format:*

Rows: Each row is a student that ...

Columns:
- Col 1:
    - Col 1 comes from call 2 and does ...
- Col 2:
    - Col 2 comes from call 1 and does ...
    
## Who reviewed an assessment submission

##### Questions for Henrie
- Q1
- Q2

*Why:* this is why we need this

*Calls Needed:*

- /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
- https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show

*Explanation of Calls:*

This GET request returns a submission Object.  In the submission is a property named "grader_id" that has the user id of the grader who reviewed and assigned a grade to a submission.  

** IMPORTANT **
This object, the Submission Object also contains a property named "submission_comments" that has the ability to contain Submission Comment Objects that have *who* gave a comment on a submission (instructor feedback) and *when* the comment was made.  This may help with the first element in this subsection ^^.

*CSV Format:*

Rows: Each row is a student that has submitted an assignment.

Columns:
- Col 1:
    - user_id
- Col 2:
    - grader_id
- Col 3:
    - Grader's Name








## *Other*

## Number of logins per day for each student

*Why:* Assuming that it is a simular reason to why they want number of page views per day

*Calls Needed:*

- https://canvas.instructure.com/doc/api/authentications_log.html#method.authentication_audit_api.for_user
```
GET /api/v1/audit/authentication/users/:user_id
```

*Explanation of Calls:*

Under the events property is a list of all the times the user has logged in. Which includeds a time stamp, so the number of logins per day can be deduced.