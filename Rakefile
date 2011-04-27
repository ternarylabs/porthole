require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

def porthole_sources
  sources = ["js/porthole.js"]
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