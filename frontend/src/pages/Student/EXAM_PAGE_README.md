# Student Exam Page Documentation

## Overview
The Student Exam Page (`StudentExam.js`) is a comprehensive exam-taking interface that displays exam questions one at a time with the following features:

- **One Question Per Screen**: Questions are displayed individually for focused exam-taking
- **Multiple Choice Options**: Four options (A, B, C, D) with visual selection indicators
- **Question Icons**: Options appear with icons (checked/unchecked radio buttons) for clear selection status
- **Exam Timer**: Countdown timer showing remaining exam time in HH:MM:SS format
- **Progress Tracking**: Progress bar showing completion percentage and current question number
- **Question Navigation**: Previous/Next buttons to move between questions
- **Question Overview Sidebar**: Mini-map showing all questions with their status
- **Flag for Review**: Mark questions for later review
- **Auto-Submit**: Automatically submits exam when time runs out
- **Submit Confirmation**: Dialog to confirm submission before final submit

## Features

### 1. Question Display
- Shows question text, instructions, and any associated images
- Displays score points for each question
- Supports four multiple-choice options
- Highlights selected option with green border and background

### 2. Navigation
- **Previous Button**: Navigate to the previous question (disabled on first question)
- **Next Button**: Navigate to the next question
- **Question Overview**: Click any question number in the sidebar to jump to that question
- **Questions numbered 1 to N** for easy reference

### 3. Timer Management
- Displays countdown in header with warning color when time is running low (< 5 minutes)
- Automatically decrements every second
- Auto-submits exam when time reaches zero
- Shows hours, minutes, and seconds format

### 4. Response Tracking
- Stores selected answers in state
- Visual indicator in sidebar showing answered questions (with checkmark icon)
- Flagged questions have orange border in sidebar
- Summary statistics showing answered and flagged question counts

### 5. Submission
- **Submit Button**: Appears at the last question
- **Confirmation Dialog**: Asks for confirmation with answer count
- **Score Calculation**: Backend auto-grades based on correct answers
- **Success Message**: Shows final score after submission
- **Redirect**: Returns to dashboard after successful submission

## Component Structure

### State Variables
```javascript
- questions: Array of exam questions
- currentQuestionIndex: Current question being viewed
- responses: Object storing student answers (question_id: option)
- loading: Loading state while fetching data
- submitting: Submission state
- timeLeft: Remaining time in seconds
- examInfo: Exam details and metadata
- openConfirm: Submission confirmation dialog state
- snackbar: Snackbar notification state
- flaggedQuestions: Set of question IDs marked for review
```

### Key Functions
- `handleSelectOption()`: Records student's selected option
- `toggleFlagQuestion()`: Flag/unflag a question
- `handleNextQuestion()`: Move to next question
- `handlePreviousQuestion()`: Move to previous question
- `handleSubmitExam()`: Submit exam and process results
- `formatTime()`: Convert seconds to HH:MM:SS format
- `showSnackbar()`: Display notification messages
- `handleCloseSnackbar()`: Close notification

## Integration

### Routes
The exam page is registered in `AppRouter.js`:
```javascript
<Route path="exam/:examId" element={<StudentExam />} />
```

Access the exam via: `/student/exam/:examId`

### API Endpoints Used
1. **Get Exam Details**: `GET /api/exams/:examId`
2. **Get Questions**: `GET /api/exam-questions/:examId`
3. **Submit Exam**: `POST /api/exam-taking/submit/:studentId/:examId`

### API Functions
Located in `frontend/src/api/exams.js`:
- `getExamById(examId)`: Fetch exam information
- `getQuestionsForExam(examId)`: Fetch exam questions
- `submitExam(studentId, examId, responses)`: Submit student responses

## Data Structures

### Question Object
```javascript
{
  question_id: number,
  text: string,
  option_a: string,
  option_b: string,
  option_c: string,
  option_d: string,
  instructions: string (optional),
  score_obtainable: number,
  question_type: string,
  file: string (optional, path to image)
}
```

### Response Object
```javascript
{
  [question_id]: "A" | "B" | "C" | "D" | null
}
```

### Exam Info Object
```javascript
{
  id: number,
  exam_name: string,
  course_name: string,
  course_code: string,
  duration: number (in minutes),
  start_time: string,
  exam_date: string,
  instruction: string,
  max_score_obtainable: number
}
```

## Styling & UI Components

### Material-UI Components Used
- `Container`: Main layout wrapper
- `Grid`: Responsive layout (9 columns main, 3 columns sidebar)
- `Paper`: Card containers
- `Typography`: Text elements
- `Button`: Navigation and submit buttons
- `RadioGroup/FormControlLabel`: Option selection
- `LinearProgress`: Progress bar
- `Dialog`: Submit confirmation
- `Snackbar/Alert`: Notifications
- `Card/CardContent`: Question display
- `Stack`: Flexible layouts

### Icons Used
- `CheckCircle`: Answered question indicator
- `RadioButtonUnchecked`: Unselected option
- `RadioButtonChecked`: Selected option
- `Timer`: Time display
- `NavigateNext/NavigateBefore`: Navigation arrows

## Responsive Design
- **Mobile (xs)**: Stacked layout, sidebar below main content
- **Tablet/Desktop (md+)**: Side-by-side layout with sticky sidebar
- **Full Width**: On very small screens, content spans full width

## Error Handling
- Gracefully handles missing exam data
- Shows error messages via snackbar notifications
- Redirects to dashboard on critical errors
- Handles network failures
- Validates responses before submission

## Accessibility Features
- Radio buttons for option selection (keyboard navigable)
- Clear visual indicators for selected options
- Time warning indicator
- Question navigation labels
- Semantic HTML structure

## Performance Considerations
- Questions loaded once at component mount
- Efficient state management
- Inline timer to prevent re-renders
- Lazy loading of exam data

## Future Enhancements
- Add keyboard shortcuts (Arrow keys for navigation, A/B/C/D for options)
- Add calculator widget for math exams
- Add drawing tools for diagram questions
- Add audio playback for listening comprehension
- Add partial marking system
- Add save functionality (not auto-submit on timeout)
- Add question search/filter
- Add visual keyboard navigation guide
- Add accessibility options (zoom, high contrast)
- Add exam review page before final submission

## Troubleshooting

### Exam Not Loading
- Check if exam ID is valid in URL
- Verify API endpoints are accessible
- Check browser console for error messages

### Timer Not Working
- Ensure system time is correct
- Check if duration is set in exam data
- Verify interval is cleared on component unmount

### Answers Not Saving
- Check Redux/Context state management
- Verify response object structure
- Check for TypeScript type mismatches

### Submission Errors
- Check network connection
- Verify backend API is running
- Check authorization token in localStorage
- Verify student ID matches authenticated user
