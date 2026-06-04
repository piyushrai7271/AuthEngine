// Register route............

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Core Authentication
 *     summary: Register a new user
 *     description: Creates a new account using email or mobile number and password. Provide either email or mobileNumber.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Piyush Rai
 *               email:
 *                 type: string
 *                 example: piyush@gmail.com
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 686d8d8c8f9a123456789abc
 *                     fullName:
 *                       type: string
 *                       example: Piyush Rai
 *                     email:
 *                       type: string
 *                       example: piyush@gmail.com
 *                     mobileNumber:
 *                       type: string
 *                       example: "7737666496"
 *                     role:
 *                       type: string
 *                       enum:
 *                         - user
 *                         - admin
 *                       example: user
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     isBlocked:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-10T12:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-10T12:30:00.000Z
 *
 *       400:
 *         description: Validation error
 *
 *       409:
 *         description: User already exists with email or mobile
 */

// Login.............

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Core Authentication
 *     summary: Login with email and password
 *     description: Authenticates a user using email and password. On successful login, accessToken and refreshToken cookies are set. Admin users receive an OTP token and must complete OTP verification before login is completed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: piyush@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 686d8d8c8f9a123456789abc
 *
 *                     fullName:
 *                       type: string
 *                       example: Piyush Rai
 *
 *                     email:
 *                       type: string
 *                       example: piyush@gmail.com
 *
 *                     mobileNumber:
 *                       type: string
 *                       example: "9876543210"
 *
 *                     role:
 *                       type: string
 *                       enum:
 *                         - user
 *                         - admin
 *                       example: user
 *
 *       400:
 *         description: Validation error or password login not available
 *
 *       401:
 *         description: Invalid email or password
 *
 *       403:
 *         description: Account is blocked
 *
 *       423:
 *         description: Account temporarily locked due to multiple failed login attempts
 */

// Refresh access Token

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Core Authentication
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token stored in cookies. The endpoint updates the accessToken cookie and returns a success response.
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Access token refreshed
 *
 *                 data:
 *                   type: object
 *                   example: {}
 *
 *       401:
 *         description: Not authenticated or invalid refresh token
 *
 *       404:
 *         description: User not found
 */

// Get user data

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Core Authentication
 *     summary: Get current user
 *     description: Returns the currently authenticated user's profile information. Requires a valid access token.
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: User fetched successfully !!
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 686d8d8c8f9a123456789abc
 *
 *                     fullName:
 *                       type: string
 *                       example: Piyush Rai
 *
 *                     email:
 *                       type: string
 *                       example: piyush@gmail.com
 *
 *                     mobileNumber:
 *                       type: string
 *                       example: "9876543210"
 *
 *                     role:
 *                       type: string
 *                       enum:
 *                         - user
 *                         - admin
 *                       example: user
 *       401:
 *         description: Unauthorized
 */
