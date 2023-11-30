from distutils.dir_util import copy_tree
import os
import shutil

os.chdir("../build")
for i in os.listdir():
    if i == ".git" or i.startswith("naver"):
        continue
    if os.path.isdir(i):
        shutil.rmtree(i)
    else:
        os.remove(i)

os.chdir("../")
for i in ["css", "js", "assets"]:
    if os.path.isdir("build/" + i):
        shutil.rmtree("build/" + i)
    copy_tree("blog-builder/" + i, "build/" + i)
copy_tree("blog-builder/pages", "build")
os.chdir("./build")
os.system("git add .")
os.system(f'git commit -m "Docs: Update blog"')
os.system("git push")
