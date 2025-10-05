from distutils.dir_util import copy_tree

dirs = ["css", "js", "assets", "files"]

# if os.path.isdir("../build"):
#     os.chdir("../build")
#     for i in dirs:
#         if os.path.isdir(i):
#             shutil.rmtree(i)
#     for i in os.listdir("../blog-builder/pages"):
#         if os.path.isdir(i):
#             shutil.rmtree(i)
#         elif os.path.isfile(i):
#             os.remove(i)
# os.chdir("../")

for i in dirs:
    # if os.path.isdir("build/" + i):
    #     shutil.rmtree("build/" + i)
    copy_tree("./" + i, "./build/" + i)
copy_tree("./pages", "./build/")
# os.chdir("./build")
# os.system("git add .")
# os.system(f'git commit -m "Docs: Update blog"')
# os.system("git push")
