# Get Data From Canvas

This repo is how we will get the data we need for analysis. 

# Needs

## *Quiz Stats*

## Studnet Quiz Scores 

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

## Number of Attempts By Student

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

## Time spent on each Quiz

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

## Performance on each Question item

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

## Time spent on each Question item

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