# Report of Assignment

## 1. Project Structure
This Web application adopts the MVC software architecture. Its file structure, as well as the functions of each file and folder, are as follows:
```
WebAssignment/
├── bin/
│   └── www.js               	# Server startup entry
├── controllers/			 	# The controller layer of the back-end application
│   ├── matchingController.js
│   ├── quizController.js   	
│   └── socketController.js
├── data/						# The persistent storage layer of the back end application
│   └── question.json        	
├── model/						# The model layer of the back end application
│   ├── quizInfo.js           
│   └── userList.js           
├── public/						# Public resources
│   ├── images/        	       	# Picture resources
│   ├── javascripts/			# Front-end responsive page JS script		
│   │   ├── hall.js           
│   │   ├── quiz.js   
│   │   ├── login.js
│   │   ├── about.js         
│   │   ├── utils/				# Front-end JS tool classes      
│   │   └── socket/				# Front-end socket.io client JS script 
│   └── stylesheets/			# Style resource			
│       ├── hall/             	# Style of Matching Hall
│       ├── quiz/             	# Style of Quiz Page
│       ├── about/				# Style of About Page
│       ├── introduction/		# Style of Introduction Page
│       ├── login/				# Style of Login Page
│       ├── error.css			# Style of Error Page
│       ├── image.css			
│       ├── loading.css			
│       └── base.css 			# Basic Style of Front-end Application
├── routes/						# Routes Management of the back-end application
│   ├── hall.js               
│   ├── login.js              
│   ├── quiz.js 
│   ├── intro.js
│   └── about.js              
├── services/					# The service layer of the back-end application
│   ├── matchingService.js    
│   ├── quizService.js        
│   └── socketService.js      
├── views/						# The view layer of the front-end application
│   ├── hall.html             
│   ├── login.html    
│   ├── intro.html 
│   ├── quiz.html            
│   ├── about.html            
│   └── error.html            
├── app.js                    # Express application instance configuration
├── sockets.js                # Server configuration of socket.io
├── package.json              # Project Dependency Management
├── .gitignore          	  # The Management of git ignore files
└── .env                      # Environment variable configuration
```

## 2. Introduction Part

The Introduction page is a static page that briefly introduces some of my basic information and contact details. The article posts on this page are linked to the articles on my personal blog "markyan04.cn" (If you click the article, since my personal blog server is in China, its response speed may be relatively slow). Meanwhile, since my entire application is designed in a responsive manner, it can automatically adapt to the screen sizes of various devices. The page on the computer and mobile devices are shown in the following figure.

In PC with a high-resolution display, the UI is given as follows.

![The introduction page in PC](./docs/introduction-pc-high.png)

In PC with a low-resolution display, the UI is given as follows.

![The introduction page in PC](./docs/introduction-pc-low.png)

In mobile device, the UI is given as follows.

![The introduction page in mobile](./docs/introduction-mobile.png)

## 3. About Part

The "About" page mainly consists of two parts, briefly introducing my technical stack and project experiences. And provide jump connections for each project. Meanwhile, since my entire application adopts a responsive design, it can automatically adapt to the screen sizes of various devices.

In PC with a high-resolution display, the UI is given as follows.

![The tech stack part of about page in PC](./docs/about-tech-pc-high.png)

![The project part of about page in PC](./docs/about-project-pc-high.png)

In PC with a low-resolution display, the UI is given as follows.

![The tech stack part of about page in PC](./docs/about-tech-pc-low.png)

![The project part of about page in PC](./docs/about-project-pc-low.png)

In mobile device, the UI is given as follows.

![The tech stack part of about page in mobile](./docs/about-tech-mobile.png)

![The project part of about page in mobile](./docs/about-project-mobile.png)

## 4.Quiz Part

The Quiz Part is the most important part of this assignment. I have divided it into three sub-parts for development. In the following three chapters, I will introduce its implementation process in detail. By the way, All the following pages have also completed the responsive design. However, I don't think this is the focus of the Quiz part, so I won't take screenshots or introduce them specifically.

### 4.1 Login Page

The Login Page mainly handles the login logic of users. Users enter their usernames on this page and then click "Login" to enter the Matching Hall Page. 

If the server detects that the username has been occupied by other online users, the front end will prompt login failure and provide a button to return to the login page.

In fact, there are no interaction events between the socket server and the client on the Login page. The socket initialization connection is triggered when entering the Matching Hall Page. I will introduce these contents in detail in the next part.

### 4.2 Matching Hall Page

### 4.3 Quiz Page

## 5. Challenges

## 6. References