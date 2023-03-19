import express from "express";
import cors from "cors";
import mongoose from "mongoose";
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

mongoose.set("strictQuery", true);

try {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/notekeepingapp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB Connected"))
    .catch((err) => console.log(err));
} catch (error) {
  handleError(error);
}

const userSchema = mongoose.Schema({
  useremail: String,
  userpass: String,
});
const keeperSchema = mongoose.Schema({
  title: String,
  label: String,
  description: String,
  created_at: String,
  userID:String
});

const Keeper = new mongoose.model("keeper", keeperSchema);
const User = new mongoose.model("user", userSchema);

app.post("/api/login", (req, res) => {
  User.findOne({ useremail: req.body.useremail }, function (err, user) {
    if (err) {
      console.log("This is Error Response");
      res.send({ message: "Login Error" });
    }
    if (user && user.userpass === req.body.userpass) {
      res.send({ message: "Login Successfull", user });
    } else {
      res.send({ message: "Password Didn't Match" });
    }
  });
});

app.post("/register", function (req, res) {
  const { useremail, userpass } = req.body;
  const userObj = new User({
    useremail,
    userpass,
  });
  userObj
    .save()
    .then((item) => {
      console.log("item saved to database", item);
      res.status(200).send({ message: "Register Successful", item });
    })
    .catch((err) => {
      console.log("unable to save to db", err);
      res.status(402).send({ message: "unable to save to database" });
    });
});

app.get("/api/getAll/", (req, res) => {
  Keeper.find({}, (err, keeperList) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send(keeperList);
    }
  });
});

app.get("/api/getid/:id", (req, res) => {
  const id = req.params.id;
  Keeper.findOne({ _id: id }).then((item) => {
    res.send(item);
  });
});

app.put("/api/edit/:id", (req, res) => {
  const { _id,title, label, description } = req.body;
  Keeper.findByIdAndUpdate({ _id },{
      $set: 
      {
         title:title, 
         label:label, 
         description:description
      }
    }
  ).then((item)=>{
    res.send({message:"Todo Updated"})
  })
});

app.post("/api/addNew", (req, res) => {
  const { title, label, description ,userID} = req.body;
  const current = new Date();
  const created_at = `${current.getDate()}/${
    current.getMonth() + 1
  }/${current.getFullYear()}`;

  const keeperObj = new Keeper({
    title,
    label,
    description,
    created_at,
    userID,
  });

  keeperObj
    .save()
    .then((item) => {
      res.status(200).send({ message: "Todo Added", item });
    })
    .catch((err) => {
      res.status(400).send({ message: "Error" });
    });
});

app.post("/api/delete", (req, res) => {
  const { id } = req.body;
  Keeper.deleteOne({ _id: id }, () => {
    Keeper.find({}, (err, keeperList) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(keeperList);
      }
    });
  });
});

app.listen(3001, () => {
  console.log("backend created at Port 3001");
});
