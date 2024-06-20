#include <mutex>
#include <thread>
#include <unistd.h>

std::mutex m;

void ThreadA(){
    int i = 0;
    while (i < 100){
        std::lock_guard<std::mutex> lock(m);
        printf("this is thread A %d\n", i);
        i++;
    }
}

void ThreadB(){
    int i = 0;
    while (i < 100){
        std::lock_guard<std::mutex> lock(m);
        printf("this is thread B %d\n", i);
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