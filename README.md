# Convention Bingo
## Overview
My friends and I wanted to play a bingo game for our yearly trip to a Science Fiction convention. I built this basic React + Flask + MySQL app to provide randomly generated bingo cards and picture upload functionality for unique users. It's very simple and was mostly built with ChatGPT.

### Database
MySQL is used as the database engine for this project. All data is stored in MySQL with the exception of image files. The schema is available in the api directory.

### API
The API service was built Flask and Python which points at a MySQL database.

These are the supported methods:


    /static/<path:filename>
    /api/login
    /api/users
    /api/boxes
    /api/card/<int:user_id>
    /api/card/<int:user_id>
    /api/card/<int:user_id>/<int:row>/<int:col>/upload
    /api/card/<int:user_id>/lock
    /api/card/<int:user_id>/unlock
    /api/card/<int:user_id>/lock-status
    /api/users/<int:user_id>/upload-avatar
    /uploads/<filename>


There is a README in the api directory with instructions on how to run this code.

### React
The React code was mostly built with chatgpt. There is a README in the react directory with instructions on how to run this code.
