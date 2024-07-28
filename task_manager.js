'use strict'

class TaskManager {
  counter = 1
  cancel = document.querySelector('.cancel').addEventListener('click', () => this.cancel = true)
  status = document.querySelector('.status').addEventListener('click', () => console.log(this.getStatus()))
  tasks = {}
  queue = []
  statusTasks = {}
  allowed = true
  cancel = false
  banned = []
  constructor(count) {
    this.countTasks = count;
  }

  addTask(task, priority, dependencies) {
    const taskName = 'task' + this.counter
    if (this.tasks[priority]) {
      this.tasks[priority].push({task, name: taskName, dependencies})
    } else {
      this.tasks[priority] = [{task, name: taskName, dependencies}]
    }
    this.statusTasks[taskName] = 'Not called'
    this.counter++
  }

  getStatus() {
    return this.statusTasks
  }

  canel() {
    this.allowed = false
  }

  timeoutTask(task) {
    let time = 0
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              task()
                  .then(resolve)
                  .catch(reject);
          }, time);
      });
  }

  prepareQueue() {
    this.queue = Object.keys(this.tasks).sort((a, b) => b - a)
  }

  async executeTasks() {
    this.prepareQueue()
    console.log(this.tasks)
    for (const priority of this.queue){
      for (let i = 0; i < this.tasks[priority].length; i += this.countTasks) {
        const names = this.tasks[priority].slice(i, i + this.countTasks).map((task) => task.name) 
        const currTasks = this.tasks[priority].slice(i, i + this.countTasks).map((task) => task.task);
        let index = 0
        for await(const task of currTasks) {
          if (!this.banned.includes(names[index])) {
            try {
              if (this.cancel) {
                this.cancel = false
                this.banned.push(names[index])
                this.statusTasks[names[index]] = 'Canceled!'
                console.log(names[index], 'was canceled')
                continue
              }
              this.banned.forEach(item => this.tasks[priority].forEach((priorityTask) => {
                if(priorityTask.dependencies.includes(item)) {
                  console.log(priorityTask.name)
                  this.banned.push(priorityTask.name)
                  this.statusTasks[priorityTask.name] = 'Canceled!'
                  this.allowed = false
                }
              }))
              if (this.allowed) {
                const res = await this.timeoutTask(task)
                this.statusTasks[names[index]] = 'Done!'
              }
              this.allowed = true

            } catch (err) {
              console.log(names[index])
              this.banned.push(names[index])
              this.statusTasks[names[index]] = 'Failed!'
            }
          }
          index++
        } 
      }
    }
    
    console.log(this.getStatus())
  }
}

const taskManager = new TaskManager(1);

taskManager.addTask(async () => {
  console.log('Выполнение задачи 1');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Задача 1 завершена');
  }, 2, []);
taskManager.addTask(async () => {
  console.log('Выполнение задачи 2');
  await new Promise((resolve, reject) => setTimeout(reject(new Error('Ошибка в задаче2')), 1000));
  console.log('Задача 2 завершена');
  }, 1, ['task1']);
taskManager.addTask(async () => {
  console.log('Выполнение задачи 3');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Задача 3 завершена');
  }, 3, []);
taskManager.addTask(async () => {
  console.log('Выполнение задачи 4');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('Задача 4 завершена');
}, 1, ['task2', 'task3']);

taskManager.addTask(async () => {
  console.log('Выполнение задачи 5');
  await new Promise((_, reject) => setTimeout(() => 
  reject(new Error('Ошибка в задаче5'))), 1500);
  }, 2, []);
taskManager.addTask(async () => {
  console.log('Выполнение задачи 6');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Задача 6 завершена');
  }, 1, []);
taskManager.addTask(async () => {
  console.log('Выполнение задачи 7');
  await new Promise(resolve => setTimeout(resolve, 2500));
  console.log('Задача 7 завершена');
  }, 2, ['task5']); 

taskManager.executeTasks();

