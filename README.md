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
    
## Time stamp of each page view by a student

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

## Time spent by a student on a page

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










## *Review Stats*

## Reviewer feedback (text sent to students about their performance)

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
    
    
## Time stamp on when assessment was completed (ready for review)

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
    
    
## Time stamp on when assessment was opened for review 

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








## *Other*

## Number of logins per day for each student

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