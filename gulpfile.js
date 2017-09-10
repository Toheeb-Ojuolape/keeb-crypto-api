const gulp = require("gulp"),
  nodemon = require("gulp-nodemon");

gulp.task("default", () => {
  nodemon({ ext: "js" });
});
