class ApiFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;

    }

    // filter(){
    //     let queryString = JSON.stringify(this.queryStr);
    //     const regex = /\b(gte|gt|lte|lt)\b/g;
    //     queryString = queryString.replace(regex, (match) => `$${match}`);
    //     const queryObj = JSON.parse(queryString);

    //     this.query = this.query.find(queryObj);

    //     return this;
    // }

    filter() {
        const queryCopy = {...this.queryStr};

        // Removing fields from the query
        const removeFields = ['sort', 'fields', 'q', 'limit', 'page'];
        removeFields.forEach(el => delete queryCopy[el]);

        // Advance filter using: lt, lte, gt, gte
        let queryStr = JSON.stringify(queryCopy);
        const regex = /\b(gt|gte|lt|lte|in)\b/g;
        queryStr = queryStr.replace(regex, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            console.log(fields);
            this.query = this.query.select(fields);

        } else{
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate(){
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        // if(this.queryStr.page){
        //     const moviesCount = await Movie.countDocuments();
        //     if(skip >= moviesCount){
        //         throw new Error('This page is not found!');
        //     }
        // }

        return this;
    }
}

module.exports = ApiFeatures;