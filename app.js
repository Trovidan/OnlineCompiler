const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const childProcess = require("child_process");
const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));

var save_name=new Array();
var save_data=new Array();
var save_count=0;
var file_number;
var file_name;
/*****************************get**************************/

app.get("/",function(req,res){
  res.render("index",{code: "", compiled: 0, output:"",fileNo: -1,file_name:""});
});

app.get('/about',function(req,res){
  res.render("about");
});

app.get('/saved',function(req,res){
  res.render("saved",{count: save_count,save_name: save_name});
}
);

app.get('/saved/:n',function(req,res){
  if(req.params.n<save_count && req.params.n>=0){
    res.render("saved_files",{name: save_name[req.params.n],data:save_data[req.params.n],count:req.params.n});
  }
});
/***************************************************************/

/*****************************post****************************/

app.post("/compile",function(req,res){
    console.log(req.body.submit);

    //selecting compile file and run file name according to selected Language

    let compile_file;
    let run_file;
    if(req.body.lang==1){
      compile_file="code.cpp"
      run_file="output1";
    }
    else if(req.body.lang==2){
      compile_file="code.c"
      run_file="output2";
    }

    //writing code to be executed in appropriate file

    fs.writeFile(compile_file,req.body.code,function(err){

      //if failed in storing file
      if(err){
        console.log(err);
      }

      //if successfull at storing code to be executed
      else{

        //saving the code;
        console.log("Success writing");
        if(req.body.submit=="1"){
          console.log(req.body.code);
          save_name.push(req.body.save);
          save_data.push(req.body.code);
          save_count+=1;
          file_number=save_count-1;
          file_name=req.body.save;
          console.log("File number : "+file_number);
        }
        if(req.body.submit=="2"){
          console.log(req.body.code);
          save_data[file_number]=req.body.code;
          save_name[file_number]=req.body.save;
          file_name=req.body.save;
          console.log("File number : "+file_number);
        }
        if(req.body.submit=="0"){
          file_number="-1";
          console.log("File number : "+file_number);
        }


        // selecting cmd to compile code according to language
        let exec_file;
        if(req.body.lang==1){
          exec_file="g++ -o output1 code.cpp";
        }
        else if(req.body.lang==2){
          exec_file="gcc -o output2 code.c";
        }

        //executing cmd to compile code
        childProcess.exec(exec_file, (error, stdout, stderr) => {

          //if failed at compilation
          if (error) {
            res.render("index",{ code:req.body.code,compiled: 2,output: `${error}`,fileNo:file_number,fileName:file_name});
          }

          //if successfull at compilation
          else{
            console.log("compilation done!");

            //running the generated executable
            let cmd = "printf '" + req.body.customInput + "' | ./"+run_file;

            childProcess.exec(cmd, (error, stdout, stderr) => {

              //if failed at running the executable
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }

              //if successfull at running the executable
              console.log("output ran");
              res.render("index",{ code:req.body.code,compiled: 1,output: `${stdout}`,fileNo:file_number,fileName:file_name});
            });
          }
        });
    }
  });

  console.log("request complete");
});

app.post("/edit/:fileNo",function(req,res){
  res.render("index",{ code:save_data[req.params.fileNo],compiled: 0,output:"",fileNo:req.params.fileNo,fileName:save_name[req.params.fileNo]});
});
/**************************************************************/

/************************Listener*****************************/

app.listen(3000,function(){
  console.log("Server is kicking!");
});
