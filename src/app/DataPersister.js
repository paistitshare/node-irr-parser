const Post = require('../model/Post');

class DataPersister {
     persist(postData) {
        const post = new Post(postData);

        post
            .save()
            .then(savedPost => console.log(savedPost))
            .catch(e => console.error(e));
    }
}

module.exports = new DataPersister();
