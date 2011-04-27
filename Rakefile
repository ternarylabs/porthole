require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

def porthole_sources
  sources = ["src/porthole.js"]
  sources
end

desc "Build documentation"
task :doc do
  puts 'Creating Documentation'
  require 'rubygems'
  require 'jsdoc_helper'

  FileUtils.rm_r "pages/jsdoc", :force => true

  JsdocHelper::Rake::Task.new(:lambda_jsdoc) do |t|
    t[:files] = porthole_sources
    t[:options] = ''
    t[:out] = 'pages/jsdoc'
  end
  Rake::Task[:lambda_jsdoc].invoke
end

namespace :example do
  
desc "Build example"
task :build do
  FileUtils.mkdir_p 'example/sandbox.ternarylabs.com/porthole/js'
  FileUtils.cp_r porthole_sources, 'example/sandbox.ternarylabs.com/porthole/js'
end

desc "Publish example"
task :publish => :build do
  system("rsync -avz --delete 'example/sandbox.ternarylabs.com/porthole' 'ternarylabs.com:sandbox.ternarylabs.com/'")
  system("rsync -avz --delete 'example/demo.auberger.com/porthole' 'auberger.com:demo.auberger.com/'")
end

end