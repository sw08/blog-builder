from distutils.dir_util import copy_tree
import os
import shutil

os.chdir("../build")
dirs = ["css", "js", "assets", "files"]
for i in dirs:
    if os.path.isdir(i):
        shutil.rmtree(i)
for i in os.listdir("../blog-builder/pages"):
    if os.path.isdir(i):
        shutil.rmtree(i)
    elif os.path.isfile(i):
        os.remove(i)

os.chdir("../")
for i in dirs:
    if os.path.isdir("build/" + i):
        shutil.rmtree("build/" + i)
    copy_tree("blog-builder/" + i, "build/" + i)
copy_tree("blog-builder/pages", "build")
os.chdir("./build")
os.system("git add .")
os.system(f'git commit -m "Docs: Update blog"')
os.system("git push")
