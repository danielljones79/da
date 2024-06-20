#include <iostream>
#include <thread>
#include <mutex>
#include <unistd.h> // for usleep

std::mutex m;

void ThreadA(){
    int i = 0;
    while (i < 100){
        m.lock();
        std::cout << "this is thread A" << " " << i << std::endl;
        m.unlock();
        usleep(1000); // Give other threads a chance
        i++;
    }
}

void ThreadB(){
    int i = 0;
    while (i < 100){
        m.lock();
        std::cout << "this is thread B" << " " << i << std::endl;
        m.unlock();
        usleep(1000);
        i++;
    }
}

int main(){
    std::thread handleA = std::thread(ThreadA);
    std::thread handleB = std::thread(ThreadB);
   
    handleA.join();
    handleB.join();
}