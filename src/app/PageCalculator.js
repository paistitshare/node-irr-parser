
module.exports = (postsNumber) => {
    const postsPerPage = 60;

    return Math.ceil(postsNumber / postsPerPage);
};
