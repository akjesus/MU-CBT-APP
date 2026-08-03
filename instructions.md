## Run the following queries on MySQL WorkBench
alter table exams rename column exam_mode to exam_type;
update exams set exam_type = 'objective' where exam_type = 'graded';

## Navigate to the backend folder and run the following command
pm2 start server.js

## Navigate to the frontend folder and run the following commands
npm run build
pm2 start server.js


