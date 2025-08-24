export const generateToken = (user, message, statusCode, res) => {
    const token = user.getJWTToken();

    res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    });

    res.json({
        success: true,
        message,
        statusCode,
        token,
        user
    });
};