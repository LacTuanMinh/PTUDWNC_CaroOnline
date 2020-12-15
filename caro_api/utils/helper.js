module.exports = {
    isBlankString: (token) => token.trim().length === 0,


    containsBlank: (token) => token.includes(' '),


    isEmailPattern: (token) => {
        const regex = /\S+@\S+\.\S+/;
        return regex.test(token)
    },
}


